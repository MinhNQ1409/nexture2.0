// Members: docs/spec/03-phan-quyen.md, 05-api.yaml /orgs/{orgId}/members.
import { and, asc, count, eq } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import { changeRoleInput, type OrgRole } from '@nexture/contracts';
import { logActivity } from './activity';
import { canOrg } from './authz';
import { requireMember, type Ctx, type DbOrTx } from './context';
import { fail } from './errors';
import { parse } from './validate';

const memberCols = {
  userId: t.organizationMembers.userId,
  name: t.user.name,
  email: t.user.email,
  role: t.organizationMembers.role,
  joinedAt: t.organizationMembers.createdAt,
};

export async function listMembers(ctx: Ctx, orgId: string) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'members.view')) fail('FORBIDDEN');
  const items = await ctx.db
    .select(memberCols)
    .from(t.organizationMembers)
    .innerJoin(t.user, eq(t.user.id, t.organizationMembers.userId))
    .where(eq(t.organizationMembers.organizationId, orgId))
    .orderBy(asc(t.organizationMembers.createdAt));
  return { items };
}

async function adminCount(db: DbOrTx, orgId: string) {
  const [r] = await db
    .select({ n: count() })
    .from(t.organizationMembers)
    .where(and(eq(t.organizationMembers.organizationId, orgId), eq(t.organizationMembers.role, 'ADMIN')));
  return r?.n ?? 0;
}

async function lockMembers(db: DbOrTx, orgId: string) {
  // Serialises role changes per org so two admins cannot demote each other at once.
  await db.select({ id: t.organizations.id }).from(t.organizations).where(eq(t.organizations.id, orgId)).for('update');
}

export async function changeRole(ctx: Ctx, orgId: string, userId: string, raw: unknown) {
  const { role: newRole } = parse(changeRoleInput, raw);
  return ctx.db.transaction(async (tx) => {
    const myRole = await requireMember(tx, ctx.actor, orgId);
    if (!canOrg(myRole, 'members.manage')) fail('FORBIDDEN');
    await lockMembers(tx, orgId);
    const [target] = await tx
      .select(memberCols)
      .from(t.organizationMembers)
      .innerJoin(t.user, eq(t.user.id, t.organizationMembers.userId))
      .where(and(eq(t.organizationMembers.organizationId, orgId), eq(t.organizationMembers.userId, userId)));
    if (!target) return fail('NOT_FOUND');
    if (target.role === newRole) return target;
    if (target.role === 'ADMIN' && (await adminCount(tx, orgId)) <= 1) fail('LAST_ADMIN');
    await tx
      .update(t.organizationMembers)
      .set({ role: newRole as OrgRole, updatedAt: new Date() })
      .where(and(eq(t.organizationMembers.organizationId, orgId), eq(t.organizationMembers.userId, userId)));
    await logActivity(tx, {
      organizationId: orgId,
      actorId: ctx.actor.userId,
      action: 'MEMBER_ROLE_CHANGED',
      targetType: 'MEMBER',
      targetId: userId,
      targetLabel: target.name,
      changes: { role: [target.role, newRole] },
    });
    return { ...target, role: newRole };
  });
}

/** ADMIN removes anyone; any member may remove themselves (leave). */
export async function removeMember(ctx: Ctx, orgId: string, userId: string): Promise<void> {
  await ctx.db.transaction(async (tx) => {
    const myRole = await requireMember(tx, ctx.actor, orgId);
    const self = userId === ctx.actor.userId;
    if (!self && !canOrg(myRole, 'members.manage')) fail('FORBIDDEN');
    await lockMembers(tx, orgId);
    const [target] = await tx
      .select(memberCols)
      .from(t.organizationMembers)
      .innerJoin(t.user, eq(t.user.id, t.organizationMembers.userId))
      .where(and(eq(t.organizationMembers.organizationId, orgId), eq(t.organizationMembers.userId, userId)));
    if (!target) return fail('NOT_FOUND');
    if (target.role === 'ADMIN' && (await adminCount(tx, orgId)) <= 1) fail('LAST_ADMIN');
    await tx.delete(t.organizationMembers).where(and(eq(t.organizationMembers.organizationId, orgId), eq(t.organizationMembers.userId, userId)));
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'MEMBER_REMOVED', targetType: 'MEMBER', targetId: userId, targetLabel: target.name });
  });
}
