// Local-disk storage only: public files (Atlas logos, covers). Keys contain the media UUID so they are not guessable.
import { readFile } from 'node:fs/promises';
import { localStorage } from '@/lib/storage';
import { contentType } from '@/lib/mime';

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join('/');
  try {
    const data = await readFile(localStorage().filePath('public', key));
    return new Response(data, { headers: { 'content-type': contentType(key), 'cache-control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('not found', { status: 404 });
  }
}
