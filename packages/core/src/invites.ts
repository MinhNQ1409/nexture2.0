// Invite links: one-time use, 7-day expiry, optional email lock. docs/spec/06-hub-man-hinh.md §2.4, UC-03/UC-04.
import { createHash, randomBytes } from 'node:crypto';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { coreTables as t } from '@nexture/db';
import { createInviteInput } from '@nexture/contracts';
import { logActivity } from './activity';
import { canOrg } from './authz';
import { requireMember, type Ctx } from './context';
import { fail } from './errors';
import { parse } from './validate';

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

async function requireInviteAdmin(ctx: Ctx, orgId: string) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'invites.manage')) fail('FORBIDDEN');
}

const inviteCols = {
  id: t.invites.id,
  role: t.invites.role,
  email: t.invites.email,
  expiresAt: t.invites.expiresAt,
  createdAt: t.invites.createdAt,
  createdById: t.user.id,
  createdByName: t.user.name,
};

type InviteRow = { id: string; role: string; email: string | null; expiresAt: Date; createdAt: Date; createdById: string; createdByName: string };
const toDto = ({ createdById, createdByName, ...r }: InviteRow) => ({ ...r, createdBy: { id: createdById, name: createdByName } });

/** Returns the full link exactly once; only the token's sha256 is stored. */
export async function createInvite(ctx: Ctx, orgId: string, raw: unknown, hubBaseUrl: string) {
  await requireInviteAdmin(ctx, orgId);
  const input = parse(createInviteInput, raw);
  const token = randomBytes(32).toString('base64url');
  const id = uuidv7();
  await ctx.db.transaction(async (tx) => {
    await tx.insert(t.invites).values({
      id,
      organizationId: orgId,
      tokenHash: hashToken(token),
      role: input.role,
      email: input.email,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      createdBy: ctx.actor.userId,
    });
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'INVITE_CREATED', targetType: 'INVITE', targetId: id, targetLabel: input.email ?? input.role });
  });
  const [row] = await ctx.db.select(inviteCols).from(t.invites).innerJoin(t.user, eq(t.user.id, t.invites.createdBy)).where(eq(t.invites.id, id));
  return { ...toDto(row!), url: `${hubBaseUrl.replace(/\/$/, '')}/invite/${token}` };
}

const activeWhere = () => and(isNull(t.invites.acceptedAt), isNull(t.invites.revokedAt), gt(t.invites.expiresAt, new Date()));

export async function listInvites(ctx: Ctx, orgId: string) {
  await requireInviteAdmin(ctx, orgId);
  const rows = await ctx.db
    .select(inviteCols)
    .from(t.invites)
    .innerJoin(t.user, eq(t.user.id, t.invites.createdBy))
    .where(and(eq(t.invites.organizationId, orgId), activeWhere()))
    .orderBy(desc(t.invites.createdAt));
  return { items: rows.map(toDto) };
}

export async function revokeInvite(ctx: Ctx, orgId: string, inviteId: string): Promise<void> {
  await requireInviteAdmin(ctx, orgId);
  await ctx.db.transaction(async (tx) => {
    const [row] = await tx
      .update(t.invites)
      .set({ revokedAt: new Date() })
      .where(and(eq(t.invites.id, inviteId), eq(t.invites.organizationId, orgId), isNull(t.invites.revokedAt), isNull(t.invites.acceptedAt)))
      .returning({ id: t.invites.id, email: t.invites.email, role: t.invites.role });
    if (!row) return fail('NOT_FOUND');
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'INVITE_REVOKED', targetType: 'INVITE', targetId: inviteId, targetLabel: row.email ?? row.role });
  });
}

async function findActive(db: Ctx['db'], token: string) {
  const [row] = await db
    .select({ invite: t.invites, organizationName: t.organizations.name, logoMediaId: t.organizations.logoMediaId })
    .from(t.invites)
    .innerJoin(t.organizations, eq(t.organizations.id, t.invites.organizationId))
    .where(and(eq(t.invites.tokenHash, hashToken(token)), activeWhere()));
  return row;
}

/** GET /invites/{token} — no login needed. */
export async function previewInvite(db: Ctx['db'], token: string) {
  const row = await findActive(db, token);
  if (!row) return fail('INVITE_INVALID');
  return { organizationName: row.organizationName, organizationLogoMediaId: row.logoMediaId, role: row.invite.role, emailRestricted: row.invite.email !== null };
}

/** POST /invites/{token}/accept. Email must match when the invite is locked to one. */
export async function acceptInvite(ctx: Ctx, token: string, userEmail: string) {
  return ctx.db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(t.invites)
      .where(and(eq(t.invites.tokenHash, hashToken(token)), activeWhere()))
      .for('update');
    if (!row) return fail('INVITE_INVALID');
    if (row.email && row.email !== userEmail.trim().toLowerCase()) fail('INVITE_EMAIL_MISMATCH');
    const [existing] = await tx
      .select({ role: t.organizationMembers.role })
      .from(t.organizationMembers)
      .where(and(eq(t.organizationMembers.organizationId, row.organizationId), eq(t.organizationMembers.userId, ctx.actor.userId)));
    if (existing) fail('ALREADY_MEMBER', { orgId: row.organizationId });
    await tx.insert(t.organizationMembers).values({ organizationId: row.organizationId, userId: ctx.actor.userId, role: row.role });
    await tx.update(t.invites).set({ acceptedAt: new Date(), acceptedBy: ctx.actor.userId }).where(eq(t.invites.id, row.id));
    const [u] = await tx.select({ name: t.user.name }).from(t.user).where(eq(t.user.id, ctx.actor.userId));
    await logActivity(tx, { organizationId: row.organizationId, actorId: ctx.actor.userId, action: 'MEMBER_JOINED', targetType: 'MEMBER', targetId: ctx.actor.userId, targetLabel: u?.name ?? null });
    return { orgId: row.organizationId };
  });
}
