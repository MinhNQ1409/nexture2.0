import { and, eq } from 'drizzle-orm';
import type { Db, Tx } from '@nexture/db';
import { coreTables as t } from '@nexture/db';
import type { OrgRole } from '@nexture/contracts';
import { fail } from './errors';

/** Caller of a core function. Built by the app from the Better Auth session. */
export type Actor = { userId: string; platformRole: 'USER' | 'NEXTURE_ADMIN' };

export type Ctx = { db: Db; actor: Actor };

export type DbOrTx = Db | Tx;

/** Returns the caller's role in the org; 404 when not a member (does not reveal the org exists). */
export async function requireMember(db: DbOrTx, actor: Actor, orgId: string): Promise<OrgRole> {
  const [row] = await db
    .select({ role: t.organizationMembers.role })
    .from(t.organizationMembers)
    .where(and(eq(t.organizationMembers.organizationId, orgId), eq(t.organizationMembers.userId, actor.userId)));
  if (!row) return fail('NOT_FOUND');
  return row.role;
}

export function requireNextureAdmin(actor: Actor): void {
  if (actor.platformRole !== 'NEXTURE_ADMIN') fail('NOT_FOUND');
}
