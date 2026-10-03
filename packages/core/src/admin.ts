// NexTure internal area (/nexture-admin, 06 §15, 05-api.yaml "nexture-admin"): see every company, hide public content,
// lock or delete a company. NexTure never reads internal data here: only names, counts and public content titles.
import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { coreTables as t } from '@nexture/db';
import { logActivity } from './activity';
import { requireNextureAdmin, type Ctx } from './context';
import { fail } from './errors';
import { KINDS } from './content/registry';
import { tableOf, type ContentType } from './content/engine';
import { flushRevalidate } from './public/flush';
import { publicState } from './public/rules';
import { atlasPath, atlasTypeOf, emptySync, syncPublic } from './public/sync';
import { parse } from './validate';

const atlasBase = (ctx: Ctx) => (ctx.atlas?.baseUrl ?? process.env.ATLAS_BASE_URL ?? '').replace(/\/$/, '');
const orgAtlasState = (o: { atlasEnabled: boolean; atlasHiddenAt: Date | null }): 'ON' | 'OFF' | 'HIDDEN' => (o.atlasHiddenAt ? 'HIDDEN' : o.atlasEnabled ? 'ON' : 'OFF');

/** GET /admin/organizations */
export async function adminListOrgs(ctx: Ctx, query: { q?: string; page?: string | number; pageSize?: string | number } = {}) {
  requireNextureAdmin(ctx.actor);
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25));
  const q = query.q?.trim();
  const where = q ? or(ilike(t.organizations.name, `%${q}%`), ilike(t.organizations.slug, `%${q}%`)) : undefined;
  const [{ total } = { total: 0 }] = await ctx.db.select({ total: count() }).from(t.organizations).where(where);
  const rows = await ctx.db
    .select({
      id: t.organizations.id,
      name: t.organizations.name,
      slug: t.organizations.slug,
      createdAt: t.organizations.createdAt,
      atlasEnabled: t.organizations.atlasEnabled,
      atlasHiddenAt: t.organizations.atlasHiddenAt,
      lockedAt: t.organizations.lockedAt,
      memberCount: sql<number>`(SELECT count(*)::int FROM core.organization_members m WHERE m.organization_id = core.organizations.id)`,
      liveCount: sql<number>`(SELECT count(*)::int FROM atlas.entities e WHERE e.org_id = core.organizations.id)`,
    })
    .from(t.organizations)
    .where(where)
    .orderBy(desc(t.organizations.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const base = atlasBase(ctx);
  return {
    page,
    pageSize,
    total,
    items: rows.map((o) => ({
      ...o,
      atlas: orgAtlasState(o),
      atlasUrl: o.atlasEnabled && !o.atlasHiddenAt && base ? `${base}/companies/${o.slug}` : null,
    })),
  };
}

async function loadOrg(ctx: Ctx, orgId: string) {
  const [o] = await ctx.db.select().from(t.organizations).where(eq(t.organizations.id, orgId));
  return o ?? fail('NOT_FOUND');
}

/** NexTure's own company ("nexture", any case or spacing) can never be deleted. */
export const isProtectedOrgName = (name: string) => name.trim().toLowerCase() === 'nexture';

/** Org header plus GET /admin/organizations/{orgId}/public-entities: content that is live, waiting, or hidden by NexTure. */
export async function adminGetOrg(ctx: Ctx, orgId: string) {
  requireNextureAdmin(ctx.actor);
  const o = await loadOrg(ctx, orgId);
  const names = await ctx.db.select({ id: t.user.id, name: t.user.name }).from(t.user).where(inArray(t.user.id, [o.atlasHiddenBy, o.lockedBy, o.createdBy].filter((x): x is string => Boolean(x))));
  const nameOf = (id: string | null) => names.find((n) => n.id === id)?.name ?? null;
  const [{ members } = { members: 0 }] = await ctx.db.select({ members: count() }).from(t.organizationMembers).where(eq(t.organizationMembers.organizationId, orgId));
  const base = atlasBase(ctx);
  const items: { type: ContentType; id: string; title: string; state: string; hiddenReason: string | null; hiddenAt: Date | null; atlasUrl: string | null }[] = [];
  for (const kind of Object.values(KINDS)) {
    const x = tableOf(kind.type);
    const rows = await ctx.db
      .select()
      .from(x)
      .where(and(eq(x.organizationId, orgId), isNull(x.deletedAt), eq(x.status, 'VERIFIED'), eq(x.visibility, 'PUBLIC')))
      .orderBy(asc(x.createdAt));
    for (const r of rows) {
      const state = publicState(r, o);
      items.push({
        type: kind.type,
        id: r.id,
        title: kind.title(r),
        state,
        hiddenReason: r.atlasHiddenReason,
        hiddenAt: r.atlasHiddenAt,
        atlasUrl: state === 'LIVE' && r.publicSlug && base ? `${base}${atlasPath(atlasTypeOf(kind.type, r as never), r.publicSlug)}` : null,
      });
    }
  }
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    createdAt: o.createdAt,
    createdBy: nameOf(o.createdBy),
    memberCount: members,
    atlas: orgAtlasState(o),
    atlasUrl: o.atlasEnabled && !o.atlasHiddenAt && base ? `${base}/companies/${o.slug}` : null,
    hiddenReason: o.atlasHiddenReason,
    hiddenAt: o.atlasHiddenAt,
    hiddenBy: nameOf(o.atlasHiddenBy),
    lockedAt: o.lockedAt,
    lockedReason: o.lockedReason,
    lockedBy: nameOf(o.lockedBy),
    items,
  };
}

const TARGETS = ['ORGANIZATION', 'STORY', 'EVENT', 'PERSON', 'PRODUCT_PROJECT'] as const;
const reason = z.string().trim().min(5, 'Lý do cần ít nhất 5 ký tự').max(500);
const hideInput = z.object({ targetType: z.enum(TARGETS), targetId: z.uuid(), reason });
const unhideInput = z.object({ targetType: z.enum(TARGETS), targetId: z.uuid() });

async function setHidden(ctx: Ctx, input: { targetType: (typeof TARGETS)[number]; targetId: string; reason: string | null }) {
  requireNextureAdmin(ctx.actor);
  const hidden = input.reason !== null;
  const set = { atlasHiddenAt: hidden ? new Date() : null, atlasHiddenReason: input.reason, atlasHiddenBy: hidden ? ctx.actor.userId : null };
  const sync = emptySync();
  await ctx.db.transaction(async (tx) => {
    let orgId: string;
    let label: string;
    if (input.targetType === 'ORGANIZATION') {
      const [o] = await tx.select().from(t.organizations).where(eq(t.organizations.id, input.targetId)).for('update');
      if (!o) return fail('NOT_FOUND');
      await tx.update(t.organizations).set(set).where(eq(t.organizations.id, o.id));
      [orgId, label] = [o.id, o.name];
      await syncPublic(tx, ctx.storage, { kind: 'org', orgId }, sync);
    } else {
      const kind = Object.values(KINDS).find((k) => k.type === input.targetType)!;
      const x = tableOf(kind.type);
      const [r] = await tx.select().from(x).where(and(eq(x.id, input.targetId), isNull(x.deletedAt))).for('update');
      if (!r) return fail('NOT_FOUND');
      await tx.update(x).set(set).where(eq(x.id, r.id));
      [orgId, label] = [r.organizationId, kind.title(r)];
      await syncPublic(tx, ctx.storage, { kind: 'entity', type: kind.type, id: r.id }, sync);
    }
    await logActivity(tx, {
      organizationId: orgId,
      actorId: ctx.actor.userId,
      action: hidden ? 'ATLAS_HIDDEN_BY_NEXTURE' : 'ATLAS_UNHIDDEN_BY_NEXTURE',
      targetType: input.targetType,
      targetId: input.targetId,
      targetLabel: label,
      changes: hidden ? { reason: [null, input.reason] } : null,
    });
  });
  await flushRevalidate(ctx, sync);
}

/** POST /admin/hide: the item (or whole company) leaves Atlas until NexTure unhides it; the company sees the reason. */
export const adminHide = async (ctx: Ctx, raw: unknown) => setHidden(ctx, parse(hideInput, raw));
/** POST /admin/unhide */
export const adminUnhide = async (ctx: Ctx, raw: unknown) => setHidden(ctx, { ...parse(unhideInput, raw), reason: null });

/** Lock: members get "đang bị khóa" instead of the org in Hub, and the profile is hidden from Atlas. */
export async function adminLockOrg(ctx: Ctx, orgId: string, raw: unknown) {
  requireNextureAdmin(ctx.actor);
  const input = parse(z.object({ reason }), raw);
  const sync = emptySync();
  await ctx.db.transaction(async (tx) => {
    const [o] = await tx.select().from(t.organizations).where(eq(t.organizations.id, orgId)).for('update');
    if (!o) return fail('NOT_FOUND');
    const now = new Date();
    await tx
      .update(t.organizations)
      .set({
        lockedAt: now,
        lockedReason: input.reason,
        lockedBy: ctx.actor.userId,
        ...(o.atlasHiddenAt ? {} : { atlasHiddenAt: now, atlasHiddenReason: `Doanh nghiệp bị khóa: ${input.reason}`.slice(0, 500), atlasHiddenBy: ctx.actor.userId }),
      })
      .where(eq(t.organizations.id, orgId));
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ORG_LOCKED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: o.name, changes: { reason: [null, input.reason] } });
    await syncPublic(tx, ctx.storage, { kind: 'org', orgId }, sync);
  });
  await flushRevalidate(ctx, sync);
  return adminGetOrg(ctx, orgId);
}

/** Unlock gives members access back; an Atlas hide stays until NexTure unhides the profile. */
export async function adminUnlockOrg(ctx: Ctx, orgId: string) {
  requireNextureAdmin(ctx.actor);
  await ctx.db.transaction(async (tx) => {
    const [o] = await tx.select().from(t.organizations).where(eq(t.organizations.id, orgId)).for('update');
    if (!o) return fail('NOT_FOUND');
    await tx.update(t.organizations).set({ lockedAt: null, lockedReason: null, lockedBy: null }).where(eq(t.organizations.id, orgId));
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ORG_UNLOCKED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: o.name });
  });
  return adminGetOrg(ctx, orgId);
}

/**
 * Permanently deletes a company and everything in it. The caller retypes the slug to confirm.
 * Atlas pages answer 410; uploaded files are removed after commit.
 */
export async function adminDeleteOrg(ctx: Ctx, orgId: string, raw: unknown) {
  requireNextureAdmin(ctx.actor);
  const { confirmSlug } = parse(z.object({ confirmSlug: z.string().trim() }), raw);
  const sync = emptySync();
  const privateKeys: string[] = [];
  await ctx.db.transaction(async (tx) => {
    const [o] = await tx.select().from(t.organizations).where(eq(t.organizations.id, orgId)).for('update');
    if (!o) return fail('NOT_FOUND');
    if (isProtectedOrgName(o.name)) fail('ORG_PROTECTED');
    if (confirmSlug !== o.slug) fail('VALIDATION_FAILED', { fields: { confirmSlug: 'Nhập đúng đường dẫn của doanh nghiệp để xác nhận' } });
    // Take everything off Atlas first (tombstones -> 410, public files queued for deletion).
    await tx.update(t.organizations).set({ atlasEnabled: false }).where(eq(t.organizations.id, orgId));
    await syncPublic(tx, ctx.storage, { kind: 'org', orgId }, sync);
    const media = await tx.select({ key: t.mediaAssets.storageKey }).from(t.mediaAssets).where(eq(t.mediaAssets.organizationId, orgId));
    privateKeys.push(...media.map((m) => m.key));
    // Cross-links reference rows of this org only; break the org <-> media/story cycles, then cascade.
    await tx.update(t.organizations).set({ logoMediaId: null, featuredStoryId: null }).where(eq(t.organizations.id, orgId));
    await tx.delete(t.organizations).where(eq(t.organizations.id, orgId));
    await logActivity(tx, { organizationId: null, actorId: ctx.actor.userId, action: 'ORG_DELETED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: `${o.name} (${o.slug})` });
  });
  await flushRevalidate(ctx, sync);
  for (const key of privateKeys) await ctx.storage?.deletePrivate(key).catch((e) => console.error('[admin] delete private file failed', key, e));
}

/** Platform-level actions (deleted companies) for the admin home. */
export async function adminRecentActions(ctx: Ctx) {
  requireNextureAdmin(ctx.actor);
  return ctx.db
    .select({ id: t.activityLogs.id, action: t.activityLogs.action, targetLabel: t.activityLogs.targetLabel, createdAt: t.activityLogs.createdAt, actor: t.user.name })
    .from(t.activityLogs)
    .leftJoin(t.user, eq(t.user.id, t.activityLogs.actorId))
    .where(inArray(t.activityLogs.action, ['ORG_DELETED', 'ORG_LOCKED', 'ORG_UNLOCKED', 'ATLAS_HIDDEN_BY_NEXTURE', 'ATLAS_UNHIDDEN_BY_NEXTURE']))
    .orderBy(desc(t.activityLogs.createdAt))
    .limit(10);
}

