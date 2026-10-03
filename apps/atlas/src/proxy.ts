// 410 for paths that were public and then removed (07-atlas-man-hinh §9).
// Next 16 renamed middleware.ts to proxy.ts; it runs on the Node runtime.
import { NextResponse, type NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

const TTL_MS = 60_000;
const MAX_KEYS = 5000;
// Only "not gone" is cached: a path that comes back (unhide, Atlas re-enabled) must stop answering 410 at once.
const live = new Map<string, number>();

async function isGone(path: string): Promise<boolean> {
  const at = live.get(path);
  if (at && Date.now() - at < TTL_MS) return false;
  const r = await db().execute(sql`SELECT 1 FROM atlas.tombstones WHERE path = ${path}`);
  live.delete(path);
  if (r.rows.length > 0) return true;
  live.set(path, Date.now());
  if (live.size > MAX_KEYS) live.delete(live.keys().next().value!);
  return false;
}

const GONE = {
  vi: { title: 'Không còn hiển thị', body: 'Nội dung này không còn hiển thị trên Atlas.', home: 'Về trang chủ' },
  en: { title: 'No longer available', body: 'This content is no longer shown on the Atlas.', home: 'Back to home' },
};
const goneHtml = (lang: 'vi' | 'en') => `<!doctype html><html lang="${lang}"><meta charset="utf-8"><title>${GONE[lang].title} · Culture Atlas</title>
<body style="font-family:Inter,system-ui,sans-serif;color:#1A1A1A;background:#F7F5F3;max-width:760px;margin:4rem auto;padding:0 1rem"><h1 style="font-family:Inter,system-ui,sans-serif">${GONE[lang].body}</h1><p><a href="/" style="color:#8B572A">${GONE[lang].home}</a></p></body></html>`;

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\/$/, '');
  if (await isGone(path)) return new NextResponse(goneHtml(req.cookies.get('atlas_lang')?.value === 'en' ? 'en' : 'vi'), { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } });
  return NextResponse.next();
}

export const config = {
  matcher: ['/companies/:slug', '/stories/:slug', '/events/:slug', '/people/:slug', '/products/:slug', '/projects/:slug'],
};
