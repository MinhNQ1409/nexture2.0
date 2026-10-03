// Sample editor logins for the three sample corporations, so a demo can switch from the admin's view to an editor's.
import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { addMemberByEmail, demoEditorEmail, type Ctx } from '@nexture/core';
import { coreTables as t } from '@nexture/db';
import { auth } from './auth';
import { db } from './db';

export const DEMO_PASSWORD = '12345678';

/** Creates {key}@gmail.com (password 12345678) when missing, then makes it EDITOR of the new sample org. */
export async function attachDemoEditors(ctx: Ctx, corps: { key: string; name: string; orgId: string }[]) {
  const a = await auth.$context;
  const out: { email: string; orgId: string }[] = [];
  for (const c of corps) {
    const email = demoEditorEmail(c.key);
    const [existing] = await db().select({ id: t.user.id }).from(t.user).where(eq(sql`lower(${t.user.email})`, email));
    if (!existing) {
      const user = await a.internalAdapter.createUser({ email, name: `Biên tập ${c.name}`, emailVerified: false }, { method: 'email-password' });
      await a.internalAdapter.linkAccount({ userId: user.id, providerId: 'credential', accountId: user.id, password: await a.password.hash(DEMO_PASSWORD) });
    }
    await addMemberByEmail(ctx, c.orgId, { email, role: 'EDITOR' });
    out.push({ email, orgId: c.orgId });
  }
  return out;
}
