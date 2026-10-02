// Culture values (06 §9): admin-managed, no review flow. Every change re-projects the org (08 §6: values reach Atlas via the company and extra.values).
import { and, asc, count, eq, inArray, isNull, sql } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import type { Tx } from '@nexture/db';
import { coreTables as t } from '@nexture/db';
import { valueInput, valueOrder, valuePatch, type ValueInput } from '@nexture/contracts';
import { diff, logActivity } from './activity';
import { canOrg } from './authz';
import { requireMember, type Ctx } from './context';
import { fail } from './errors';
import { flushRevalidate } from './public/flush';
import { emptySync, syncPublic } from './public/sync';
import { parse } from './validate';

type ValueRow = typeof t.cultureValues.$inferSelect;

async function counts(ctx: Ctx, orgId: string, ids: string[]) {
  if (!ids.length) return new Map<string, { stories: number; events: number }>();
  const rows = await ctx.db
    .select({ id: t.relationships.targetId, type: t.relationships.sourceType, n: count() })
    .from(t.relationships)
    .where(and(eq(t.relationships.organizationId, orgId), eq(t.relationships.targetType, 'CULTURE_VALUE'), inArray(t.relationships.targetId, ids)))
    .groupBy(t.relationships.targetId, t.relationships.sourceType);
  const out = new Map(ids.map((id) => [id, { stories: 0, events: 0 }]));
  for (const r of rows) {
    const c = out.get(r.id)!;
    if (r.type === 'STORY') c.stories = r.n;
    if (r.type === 'EVENT') c.events = r.n;
  }
  return out;
}

const dto = (v: ValueRow, c = { stories: 0, events: 0 }) => ({
  id: v.id,
  nameVi: v.nameVi,
  descriptionVi: v.descriptionVi,
  visibility: v.visibility,
  sortOrder: v.sortOrder,
  version: v.version,
  storyCount: c.stories,
  eventCount: c.events,
});
export type ValueDto = ReturnType<typeof dto>;

export async function listValues(ctx: Ctx, orgId: string) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const rows = await ctx.db
    .select()
    .from(t.cultureValues)
    .where(and(eq(t.cultureValues.organizationId, orgId), isNull(t.cultureValues.deletedAt)))
    .orderBy(asc(t.cultureValues.sortOrder), asc(t.cultureValues.createdAt));
  const visible = role === 'VIEWER' ? rows.filter((v) => v.visibility !== 'PRIVATE') : rows;
  const c = await counts(ctx, orgId, visible.map((v) => v.id));
  return { items: visible.map((v) => dto(v, c.get(v.id))) };
}

/** Runs a value change as admin, then re-projects the org when it is on Atlas. */
async function asAdmin<T>(ctx: Ctx, orgId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'values.manage')) fail('FORBIDDEN');
  const sync = emptySync();
  const out = await ctx.db.transaction(async (tx) => {
    const r = await fn(tx);
    const [org] = await tx.select({ on: t.organizations.atlasEnabled }).from(t.organizations).where(eq(t.organizations.id, orgId));
    if (org?.on) await syncPublic(tx, ctx.storage, { kind: 'org', orgId }, sync);
    return r;
  });
  await flushRevalidate(ctx, sync);
  return out;
}

async function nameTaken(tx: Tx, orgId: string, name: string, exceptId?: string) {
  const rows = await tx
    .select({ id: t.cultureValues.id })
    .from(t.cultureValues)
    .where(and(eq(t.cultureValues.organizationId, orgId), isNull(t.cultureValues.deletedAt), sql`lower(${t.cultureValues.nameVi}) = lower(${name})`));
  return rows.some((r) => r.id !== exceptId);
}

export async function createValue(ctx: Ctx, orgId: string, raw: ValueInput | unknown) {
  const input = parse(valueInput, raw);
  return asAdmin(ctx, orgId, async (tx) => {
    if (await nameTaken(tx, orgId, input.nameVi)) fail('VALUE_NAME_TAKEN');
    const [{ max } = { max: 0 }] = await tx
      .select({ max: sql<number>`coalesce(max(${t.cultureValues.sortOrder}), 0)::int` })
      .from(t.cultureValues)
      .where(and(eq(t.cultureValues.organizationId, orgId), isNull(t.cultureValues.deletedAt)));
    const [v] = await tx
      .insert(t.cultureValues)
      .values({ id: uuidv7(), organizationId: orgId, ...input, sortOrder: max + 1, createdBy: ctx.actor.userId, updatedBy: ctx.actor.userId })
      .returning();
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ENTITY_CREATED', targetType: 'CULTURE_VALUE', targetId: v!.id, targetLabel: v!.nameVi });
    return dto(v!);
  });
}

export async function updateValue(ctx: Ctx, orgId: string, id: string, raw: unknown) {
  const { version, ...patch } = parse(valuePatch, raw);
  return asAdmin(ctx, orgId, async (tx) => {
    const [v] = await tx
      .select()
      .from(t.cultureValues)
      .where(and(eq(t.cultureValues.id, id), eq(t.cultureValues.organizationId, orgId), isNull(t.cultureValues.deletedAt)))
      .for('update');
    if (!v) return fail('NOT_FOUND');
    if (v.version !== version) fail('VERSION_CONFLICT');
    if (patch.nameVi && (await nameTaken(tx, orgId, patch.nameVi, id))) fail('VALUE_NAME_TAKEN');
    const set = Object.fromEntries(Object.entries(patch).filter(([, x]) => x !== undefined));
    const [u] = await tx
      .update(t.cultureValues)
      .set({ ...set, version: sql`${t.cultureValues.version} + 1`, updatedBy: ctx.actor.userId, updatedAt: new Date() })
      .where(eq(t.cultureValues.id, id))
      .returning();
    const changes = diff(v as unknown as Record<string, unknown>, set);
    if (Object.keys(changes).length) {
      await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ENTITY_UPDATED', targetType: 'CULTURE_VALUE', targetId: id, targetLabel: u!.nameVi, changes });
    }
    return dto(u!);
  });
}

export async function deleteValue(ctx: Ctx, orgId: string, id: string): Promise<void> {
  await asAdmin(ctx, orgId, async (tx) => {
    const [v] = await tx
      .update(t.cultureValues)
      .set({ deletedAt: new Date(), updatedBy: ctx.actor.userId, updatedAt: new Date() })
      .where(and(eq(t.cultureValues.id, id), eq(t.cultureValues.organizationId, orgId), isNull(t.cultureValues.deletedAt)))
      .returning();
    if (!v) return fail('NOT_FOUND');
    await tx.execute(sql`DELETE FROM core.relationships WHERE target_type = 'CULTURE_VALUE' AND target_id = ${id}`);
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ENTITY_DELETED', targetType: 'CULTURE_VALUE', targetId: id, targetLabel: v.nameVi });
  });
}

export async function reorderValues(ctx: Ctx, orgId: string, raw: unknown): Promise<void> {
  const { ids } = parse(valueOrder, raw);
  await asAdmin(ctx, orgId, async (tx) => {
    const rows = await tx
      .select({ id: t.cultureValues.id })
      .from(t.cultureValues)
      .where(and(eq(t.cultureValues.organizationId, orgId), isNull(t.cultureValues.deletedAt)));
    const current = new Set(rows.map((r) => r.id));
    if (ids.length !== current.size || ids.some((x) => !current.has(x))) fail('VALIDATION_FAILED', { fields: { ids: 'Phải gồm đủ các giá trị hiện có' } });
    for (const [i, id] of ids.entries()) await tx.update(t.cultureValues).set({ sortOrder: i + 1 }).where(eq(t.cultureValues.id, id));
  });
}
