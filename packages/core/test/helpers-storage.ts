import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { LocalStorage } from '../src/storage';
import type { Ctx } from '../src/context';
import { completeUpload, createUploadUrl } from '../src/media';

export async function tempStorage() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'nexture-files-'));
  return new LocalStorage(root, 'http://hub.test', 'test-secret');
}

/** Uploads a fake PNG through the real 3-step flow and returns the READY media id. */
export async function uploadImage(ctx: Ctx, orgId: string, name = 'logo.png') {
  const storage = ctx.storage as LocalStorage;
  const bytes = Buffer.from('89504e470d0a1a0a', 'hex');
  const { mediaId } = await createUploadUrl(ctx, orgId, { filename: name, mimeType: 'image/png', sizeBytes: bytes.length });
  const [m] = await ctx.db.query.mediaAssets.findMany({ where: (m, { eq }) => eq(m.id, mediaId) });
  const file = storage.filePath('private', m!.storageKey);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
  await completeUpload(ctx, orgId, mediaId, { width: 10, height: 10 });
  return mediaId;
}
