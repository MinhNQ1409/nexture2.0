// Sources & evidence of a story / event / person / product (06 §7 tab "Nguồn & bằng chứng", 05-api.yaml .../sources).
// Public sources reach Atlas through syncPublic (08 §3); a library file shows only its title there.
import { and, eq, isNull, max } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { coreTables as t } from '@nexture/db';
import { sourceInput, sourcePatch } from '@nexture/contracts';
import { logActivity } from '../activity';
import { entityPermissions } from '../authz';
import { requireMember, type Ctx, type DbOrTx } from '../context';
import { fail } from '../errors';
import { parse } from '../validate';
import { afterContentChange, loadContent, type KindDef } from './engine';
import { KINDS } from './registry';

export { entitySources, type SourceDto } from './source-list';

function kindOf(collection: string): KindDef {
  return KINDS[collection] ?? fail('NOT_FOUND');
}

/** Runs `fn` on an item the caller may edit, then re-syncs Atlas and returns the item. */
async function editSources(ctx: Ctx, collection: string, orgId: string, id: string, fn: (tx: DbOrTx, kind: KindDef, label: string) => Promise<void>) {
  const kind = kindOf(collection);
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  return afterContentChange(ctx, orgId, kind, id, async (tx) => {
    const self = await loadContent<typeof t.events.$inferSelect>(tx, kind, role, orgId, id, true);
    if (!entityPermissions(role, ctx.actor.userId, self).canEdit) fail('FORBIDDEN');
    await fn(tx, kind, kind.title(self));
    return { row: self, role };
  });
}

/** POST .../sources */
export async function addSource(ctx: Ctx, collection: string, orgId: string, id: string, raw: unknown) {
  const input = parse(sourceInput, raw);
  return editSources(ctx, collection, orgId, id, async (tx, kind, label) => {
    if (input.mediaId) {
      const [m] = await tx
        .select({ id: t.mediaAssets.id })
        .from(t.mediaAssets)
        .where(and(eq(t.mediaAssets.id, input.mediaId), eq(t.mediaAssets.organizationId, orgId), eq(t.mediaAssets.uploadStatus, 'READY'), isNull(t.mediaAssets.deletedAt)));
      if (!m) fail('MEDIA_NOT_READY', { fields: { mediaId: 'Tư liệu không tồn tại' } });
    }
    const [{ top } = { top: null }] = await tx
      .select({ top: max(t.entitySources.sortOrder) })
      .from(t.entitySources)
      .where(and(eq(t.entitySources.entityId, id), isNull(t.entitySources.deletedAt)));
    await tx.insert(t.entitySources).values({
      id: uuidv7(),
      organizationId: orgId,
      entityType: kind.type,
      entityId: id,
      mediaId: input.mediaId ?? null,
      url: input.url ?? null,
      title: input.title,
      note: input.note,
      isPublic: input.isPublic,
      sortOrder: (top ?? -1) + 1,
      createdBy: ctx.actor.userId,
    });
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'SOURCE_ADDED', targetType: kind.type, targetId: id, targetLabel: label, changes: { source: [null, input.title] } });
  });
}

async function loadSource(tx: DbOrTx, id: string, sourceId: string) {
  const [s] = await tx
    .select()
    .from(t.entitySources)
    .where(and(eq(t.entitySources.id, sourceId), eq(t.entitySources.entityId, id), isNull(t.entitySources.deletedAt)));
  return s ?? fail('NOT_FOUND');
}

/** PATCH .../sources/{sourceId} */
export async function updateSource(ctx: Ctx, collection: string, orgId: string, id: string, sourceId: string, raw: unknown) {
  const patch = parse(sourcePatch, raw);
  return editSources(ctx, collection, orgId, id, async (tx, kind, label) => {
    const s = await loadSource(tx, id, sourceId);
    const set = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    if (!Object.keys(set).length) return;
    await tx.update(t.entitySources).set(set).where(eq(t.entitySources.id, sourceId));
    if (patch.sortOrder === undefined || Object.keys(set).length > 1) {
      await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'SOURCE_UPDATED', targetType: kind.type, targetId: id, targetLabel: label, changes: { source: [s.title, patch.title ?? s.title] } });
    }
  });
}

/** DELETE .../sources/{sourceId} */
export async function removeSource(ctx: Ctx, collection: string, orgId: string, id: string, sourceId: string) {
  return editSources(ctx, collection, orgId, id, async (tx, kind, label) => {
    const s = await loadSource(tx, id, sourceId);
    await tx.update(t.entitySources).set({ deletedAt: new Date() }).where(eq(t.entitySources.id, sourceId));
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'SOURCE_REMOVED', targetType: kind.type, targetId: id, targetLabel: label, changes: { source: [s.title, null] } });
  });
}
