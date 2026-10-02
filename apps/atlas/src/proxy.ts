// 410 for paths that were public and then removed (07-atlas-man-hinh §9).
// Next 16 renamed middleware.ts to proxy.ts; it runs on the Node runtime.
import { NextResponse, type NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

const TTL_MS = 60_000;
const MAX_KEYS = 5000;
const cache = new Map<string, { gone: boolean; at: number }>();

async function isGone(path: string): Promise<boolean> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.gone;
  const r = await db().execute(sql`SELECT 1 FROM atlas.tombstones WHERE path = ${path}`);
  const gone = r.rows.length > 0;
  cache.delete(path);
  cache.set(path, { gone, at: Date.now() });
  if (cache.size > MAX_KEYS) cache.delete(cache.keys().next().value!);
  return gone;
}

const GONE_HTML = `<!doctype html><html lang="vi"><meta charset="utf-8"><title>Không còn hiển thị · Culture Atlas</title>
<body style="font-family:Inter,system-ui,sans-serif;color:#2C3E50;background:#F6F7F9;max-width:760px;margin:4rem auto;padding:0 1rem"><h1 style="font-family:'Be Vietnam Pro',system-ui,sans-serif">Nội dung này không còn hiển thị trên Atlas.</h1><p><a href="/" style="color:#075E9A">Về trang chủ</a></p></body></html>`;

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\/$/, '');
  if (await isGone(path)) return new NextResponse(GONE_HTML, { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } });
  return NextResponse.next();
}

export const config = {
  matcher: ['/companies/:slug', '/stories/:slug', '/events/:slug', '/people/:slug', '/products/:slug', '/projects/:slug'],
};
