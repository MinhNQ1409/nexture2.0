import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Actor, Ctx } from '@nexture/core';
import { auth } from './auth';
import { db } from './db';

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export function actorOf(user: { id: string; platformRole?: unknown }): Actor {
  return { userId: user.id, platformRole: user.platformRole === 'NEXTURE_ADMIN' ? 'NEXTURE_ADMIN' : 'USER' };
}

/** For server components: redirects to /login when signed out. */
export async function requirePageCtx(next?: string): Promise<Ctx & { user: { id: string; name: string; email: string } }> {
  const s = await getSession();
  if (!s) redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
  return { db: db(), actor: actorOf(s.user), user: s.user };
}
