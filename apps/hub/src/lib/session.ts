import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOrg, type Actor, type Ctx } from '@nexture/core';
import { adminEmails, auth } from './auth';
import { db } from './db';
import { atlasNotifier, storage } from './storage';

/** One session lookup per request, shared by the layout and the page. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** NEXTURE_ADMIN from the stored role, or from NEXTURE_ADMIN_EMAILS for accounts created before the list was set. */
export function actorOf(user: { id: string; email: string; platformRole?: unknown }): Actor {
  const admin = user.platformRole === 'NEXTURE_ADMIN' || adminEmails().includes(user.email.toLowerCase());
  return { userId: user.id, platformRole: admin ? 'NEXTURE_ADMIN' : 'USER' };
}

type PageCtx = Ctx & { user: { id: string; name: string; email: string } };

// One ctx object per request, so per-request caches keyed on it (orgOf) are shared by layout and page.
const pageCtx = cache(async (): Promise<PageCtx | null> => {
  const s = await getSession();
  return s ? { db: db(), actor: actorOf(s.user), user: s.user, storage: storage(), atlas: atlasNotifier() } : null;
});

/** For server components: redirects to /login when signed out. */
export async function requirePageCtx(next?: string): Promise<PageCtx> {
  const ctx = await pageCtx();
  if (!ctx) redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
  return ctx;
}

/** getOrg, deduplicated within one request (the org layout and its page both need it). */
export const orgOf = cache((ctx: Ctx, orgId: string) => getOrg(ctx, orgId));
