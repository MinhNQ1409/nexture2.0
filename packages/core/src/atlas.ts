// Company profile on Atlas: docs/spec/04-trang-thai.md §5, 05-api.yaml /orgs/{orgId}/atlas.
import { and, eq, isNull } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import { logActivity } from './activity';
import { canOrg } from './authz';
import { requireMember, type Ctx, type DbOrTx } from './context';
import { fail } from './errors';
import { missingAtlasFields } from './orgs';
import { flushRevalidate } from './public/flush';
import { publicState, isOrgPublic } from './public/rules';
import { emptySync, syncPublic } from './public/sync';

async function status(ctx: Ctx, db: DbOrTx, orgId: string) {
  const [org] = await db.select().from(t.organizations).where(eq(t.organizations.id, orgId));
  if (!org) return fail('NOT_FOUND');
  const missing = await missingAtlasFields(db, org);
  const events = await db
    .select({ status: t.events.status, visibility: t.events.visibility, deletedAt: t.events.deletedAt, atlasHiddenAt: t.events.atlasHiddenAt })
    .from(t.events)
    .where(and(eq(t.events.organizationId, orgId), isNull(t.events.deletedAt)));
  const zero = () => ({ stories: 0, events: 0, people: 0, products: 0, media: 0 });
  const counts = { live: zero(), waitingOrg: zero(), hidden: zero() };
  const verifiedNotPublic = zero();
  for (const e of events) {
    const s = publicState(e, org);
    if (s === 'LIVE') counts.live.events++;
    else if (s === 'WAITING_ORG') counts.waitingOrg.events++;
    else if (s === 'HIDDEN_BY_NEXTURE') counts.hidden.events++;
    else if (e.status === 'VERIFIED') verifiedNotPublic.events++;
  }
  const base = ctx.atlas?.baseUrl ?? process.env.ATLAS_BASE_URL;
  return {
    enabled: org.atlasEnabled,
    hiddenReason: org.atlasHiddenReason,
    profileUrl: isOrgPublic(org) && base ? `${base.replace(/\/$/, '')}/companies/${org.slug}` : null,
    profileComplete: missing.length === 0,
    missingFields: missing,
    lastSyncedAt: null,
    counts,
    verifiedNotPublic,
  };
}

export async function getAtlasStatus(ctx: Ctx, orgId: string) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'atlas.view')) fail('FORBIDDEN');
  return status(ctx, ctx.db, orgId);
}

/** PUT /orgs/{orgId}/atlas. Enabling locks the slug forever (02-database-ghi-chu §2). */
export async function setAtlasEnabled(ctx: Ctx, orgId: string, raw: unknown) {
  const enabled = (raw as { enabled?: unknown })?.enabled;
  if (typeof enabled !== 'boolean') return fail('VALIDATION_FAILED', { fields: { enabled: 'Bắt buộc' } });
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'org.toggleAtlas')) fail('FORBIDDEN');
  const sync = emptySync();
  await ctx.db.transaction(async (tx) => {
    const [org] = await tx.select().from(t.organizations).where(eq(t.organizations.id, orgId)).for('update');
    if (!org) return fail('NOT_FOUND');
    if (org.atlasEnabled === enabled) return;
    if (enabled) {
      const missing = await missingAtlasFields(tx, org);
      if (missing.length) fail('ATLAS_PROFILE_INCOMPLETE', { fields: missing });
    }
    const now = new Date();
    await tx
      .update(t.organizations)
      .set({
        atlasEnabled: enabled,
        ...(enabled && !org.atlasFirstEnabledAt ? { atlasFirstEnabledAt: now, slugLocked: true } : {}),
        updatedAt: now,
      })
      .where(eq(t.organizations.id, orgId));
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: enabled ? 'ATLAS_ENABLED' : 'ATLAS_DISABLED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: org.name });
    await syncPublic(tx, ctx.storage, { kind: 'org', orgId }, sync);
  });
  await flushRevalidate(ctx, sync);
  return status(ctx, ctx.db, orgId);
}
