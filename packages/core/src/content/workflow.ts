// Status and visibility transitions: docs/spec/04-trang-thai.md §1–2. Each runs in one transaction,
// checks `version`, bumps it, logs activity and re-projects to Atlas; Atlas is told after commit.
import { eq, sql } from 'drizzle-orm';
import type { Tx } from '@nexture/db';
import { coreTables as t } from '@nexture/db';
import { returnInput, versionOnly, visibilityInput, type OrgRole } from '@nexture/contracts';
import { logActivity, type ActivityAction } from '../activity';
import { entityPermissions, type ContentStatus, type Visibility } from '../authz';
import { requireMember, type Ctx } from '../context';
import { fail } from '../errors';
import { flushRevalidate } from '../public/flush';
import { emptySync, syncPublic, type PublicEntityType } from '../public/sync';
import { parse } from '../validate';
import { eventDto, loadEvent, type EventRow } from './events';

export const COLLECTIONS = { events: 'EVENT' } as const;
export type Collection = keyof typeof COLLECTIONS;

/** Fields required before submit/approve (04 §4). Events need nothing beyond NOT NULL columns. */
const REQUIRED_FOR_REVIEW: Record<PublicEntityType, (row: EventRow) => string[]> = { EVENT: () => [] };

/** Runs a content mutation, syncs Atlas in the same transaction, flushes after commit, returns the DTO. */
export async function afterContentChange(
  ctx: Ctx,
  orgId: string,
  scope: { type: PublicEntityType; id: string },
  fn: (tx: Tx) => Promise<{ row: EventRow; role: OrgRole }>,
) {
  const sync = emptySync();
  const { row, role } = await ctx.db.transaction(async (tx) => {
    const r = await fn(tx);
    await syncPublic(tx, ctx.storage, { kind: 'entity', type: scope.type, id: scope.id }, sync);
    const [fresh] = await tx.select().from(t.events).where(eq(t.events.id, scope.id));
    return { row: fresh ?? r.row, role: r.role };
  });
  await flushRevalidate(ctx, sync);
  return eventDto(ctx, row, role);
}

type Transition = {
  from: ContentStatus[];
  to: ContentStatus;
  allowed: (p: ReturnType<typeof entityPermissions>) => boolean;
  action: ActivityAction;
  set: (userId: string, now: Date, note?: string) => Partial<typeof t.events.$inferInsert>;
  checkRequired?: boolean;
};

const TRANSITIONS: Record<'submit' | 'withdraw' | 'approve' | 'return' | 'unverify', Transition> = {
  submit: {
    from: ['DRAFT'],
    to: 'PENDING_REVIEW',
    allowed: (p) => p.canSubmit,
    action: 'ENTITY_SUBMITTED',
    set: (u, now) => ({ submittedBy: u, submittedAt: now, returnNote: null }),
    checkRequired: true,
  },
  withdraw: { from: ['PENDING_REVIEW'], to: 'DRAFT', allowed: (p) => p.canWithdraw, action: 'ENTITY_RETURNED', set: () => ({ submittedBy: null, submittedAt: null }) },
  approve: {
    from: ['DRAFT', 'PENDING_REVIEW'],
    to: 'VERIFIED',
    allowed: (p) => p.canApprove,
    action: 'ENTITY_APPROVED',
    set: (u, now) => ({ verifiedBy: u, verifiedAt: now, returnNote: null }),
    checkRequired: true,
  },
  return: {
    from: ['PENDING_REVIEW'],
    to: 'DRAFT',
    allowed: (p) => p.canReturn,
    action: 'ENTITY_RETURNED',
    set: (_u, _now, note) => ({ returnNote: note, submittedBy: null, submittedAt: null }),
  },
  unverify: { from: ['VERIFIED'], to: 'DRAFT', allowed: (p) => p.canUnverify, action: 'ENTITY_UNVERIFIED', set: () => ({ verifiedBy: null, verifiedAt: null }) },
};
export type TransitionName = keyof typeof TRANSITIONS;

function collectionType(collection: string): PublicEntityType {
  const type = COLLECTIONS[collection as Collection];
  if (!type) return fail('NOT_FOUND');
  return type;
}

export async function transition(ctx: Ctx, collection: string, orgId: string, id: string, name: TransitionName, raw: unknown) {
  const type = collectionType(collection);
  const def = TRANSITIONS[name];
  if (!def) return fail('NOT_FOUND');
  const { version, note } = name === 'return' ? parse(returnInput, raw) : { ...parse(versionOnly, raw), note: undefined };
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  return afterContentChange(ctx, orgId, { type, id }, async (tx) => {
    const e = await loadEvent(tx, role, orgId, id, true);
    const perms = entityPermissions(role, ctx.actor.userId, e);
    if (!def.from.includes(e.status)) fail('INVALID_TRANSITION', { from: e.status, action: name });
    if (!def.allowed(perms)) fail('FORBIDDEN');
    if (e.version !== version) fail('VERSION_CONFLICT');
    if (def.checkRequired) {
      const missing = REQUIRED_FOR_REVIEW[type](e);
      if (missing.length) fail('REQUIRED_FOR_REVIEW', { fields: missing });
    }
    const now = new Date();
    const set: Partial<typeof t.events.$inferInsert> = { ...def.set(ctx.actor.userId, now, note), status: def.to };
    // 04 §1: unverifying PUBLIC content drops it to INTERNAL in the same transaction.
    const dropPublic = name === 'unverify' && e.visibility === 'PUBLIC';
    if (dropPublic) set.visibility = 'INTERNAL';
    const [u] = await tx
      .update(t.events)
      .set({ ...set, version: sql`${t.events.version} + 1`, updatedBy: ctx.actor.userId, updatedAt: now })
      .where(eq(t.events.id, id))
      .returning();
    const log = { organizationId: orgId, actorId: ctx.actor.userId, targetType: type, targetId: id, targetLabel: e.titleVi };
    await logActivity(tx, { ...log, action: def.action, changes: { status: [e.status, def.to], ...(note ? { note: [null, note] } : {}) } });
    if (dropPublic) await logActivity(tx, { ...log, action: 'VISIBILITY_CHANGED', changes: { visibility: ['PUBLIC', 'INTERNAL'] } });
    return { row: u!, role };
  });
}

export async function setVisibility(ctx: Ctx, collection: string, orgId: string, id: string, raw: unknown) {
  const type = collectionType(collection);
  const { version, visibility } = parse(visibilityInput, raw);
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  return afterContentChange(ctx, orgId, { type, id }, async (tx) => {
    const e = await loadEvent(tx, role, orgId, id, true);
    if (visibility === 'PUBLIC') {
      if (role !== 'ADMIN') fail('FORBIDDEN');
      if (e.status !== 'VERIFIED') fail('NOT_VERIFIED');
    } else if (!entityPermissions(role, ctx.actor.userId, e).allowedVisibilities.includes(visibility)) {
      fail('FORBIDDEN');
    }
    if (e.version !== version) fail('VERSION_CONFLICT');
    if (e.visibility === visibility) return { row: e, role };
    const [u] = await tx
      .update(t.events)
      .set({ visibility: visibility as Visibility, version: sql`${t.events.version} + 1`, updatedBy: ctx.actor.userId, updatedAt: new Date() })
      .where(eq(t.events.id, id))
      .returning();
    await logActivity(tx, {
      organizationId: orgId,
      actorId: ctx.actor.userId,
      action: 'VISIBILITY_CHANGED',
      targetType: type,
      targetId: id,
      targetLabel: e.titleVi,
      changes: { visibility: [e.visibility, visibility] },
    });
    return { row: u!, role };
  });
}
