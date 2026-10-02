// Public files (Atlas logos, covers) for every storage driver, so no public bucket domain is needed.
// Keys contain the media UUID so they are not guessable.
import { storage } from '@/lib/storage';
import { contentType } from '@/lib/mime';

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join('/');
  const data = await storage().readPublic(key).catch(() => null);
  if (!data) return new Response('not found', { status: 404 });
  return new Response(data as BodyInit, { headers: { 'content-type': contentType(key), 'cache-control': 'public, max-age=31536000, immutable' } });
}
