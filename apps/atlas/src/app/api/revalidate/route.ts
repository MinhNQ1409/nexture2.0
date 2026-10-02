// POST /api/revalidate from Hub after a publish change (07-atlas-man-hinh §11).
import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

function secretOk(given: string | null) {
  const expected = process.env.ATLAS_REVALIDATE_SECRET ?? '';
  if (!given || !expected || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(req: Request) {
  if (!secretOk(req.headers.get('x-revalidate-secret'))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === 'string').slice(0, 200) : [];
  for (const tag of tags) revalidateTag(tag, 'max');
  return NextResponse.json({ revalidated: tags.length });
}
