import { asc, eq } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import type { Ctx } from './context';
import { fail } from './errors';

/** GET /me */
export async function getMe(ctx: Ctx) {
  const [u] = await ctx.db
    .select({ id: t.user.id, name: t.user.name, email: t.user.email, platformRole: t.user.platformRole })
    .from(t.user)
    .where(eq(t.user.id, ctx.actor.userId));
  if (!u) return fail('UNAUTHENTICATED');
  const organizations = await ctx.db
    .select({ id: t.organizations.id, name: t.organizations.name, slug: t.organizations.slug, logoMediaId: t.organizations.logoMediaId, role: t.organizationMembers.role })
    .from(t.organizationMembers)
    .innerJoin(t.organizations, eq(t.organizations.id, t.organizationMembers.organizationId))
    .where(eq(t.organizationMembers.userId, ctx.actor.userId))
    .orderBy(asc(t.organizations.name));
  return { ...u, organizations };
}
