// Local-disk storage only: signed PUT (upload) and GET (view) of private files.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { verifyLocalSignature } from '@nexture/core';
import { contentType } from '@/lib/mime';
import { localStorage } from '@/lib/storage';

type P = { params: Promise<{ key: string[] }> };
const MAX = 500 * 1024 * 1024;

function check(req: Request, method: string, key: string) {
  const u = new URL(req.url);
  return verifyLocalSignature(process.env.BETTER_AUTH_SECRET ?? 'dev-secret', method, key, u.searchParams.get('exp'), u.searchParams.get('sig'));
}

export async function PUT(req: Request, { params }: P) {
  const key = (await params).key.join('/');
  if (process.env.S3_ENDPOINT || !check(req, 'PUT', key)) return new Response('forbidden', { status: 403 });
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length > MAX) return new Response('too large', { status: 413 });
  const file = localStorage().filePath('private', key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
  return new Response(null, { status: 200 });
}

export async function GET(req: Request, { params }: P) {
  const key = (await params).key.join('/');
  if (process.env.S3_ENDPOINT || !check(req, 'GET', key)) return new Response('forbidden', { status: 403 });
  try {
    const data = await readFile(localStorage().filePath('private', key));
    return new Response(data, { headers: { 'content-type': contentType(key), 'cache-control': 'private, max-age=3600' } });
  } catch {
    return new Response('not found', { status: 404 });
  }
}
