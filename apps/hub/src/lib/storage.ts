import 'server-only';
import path from 'node:path';
import { LocalStorage, S3Storage, type AtlasNotifier, type Storage } from '@nexture/core';

let cached: Storage | undefined;

/** S3-compatible storage (R2, MinIO) when S3_ENDPOINT is set; otherwise files on local disk (dev, demo on one machine). */
export function storage(): Storage {
  if (cached) return cached;
  const env = process.env;
  cached = env.S3_ENDPOINT
    ? new S3Storage({
        endpoint: env.S3_ENDPOINT,
        accessKeyId: env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? '',
        privateBucket: env.R2_PRIVATE_BUCKET ?? 'nexture-private',
        publicBucket: env.R2_PUBLIC_BUCKET ?? 'nexture-public',
        publicBaseUrl: env.R2_PUBLIC_BASE_URL ?? '',
      })
    : localStorage();
  return cached;
}

export function localStorage(): LocalStorage {
  return new LocalStorage(
    process.env.LOCAL_STORAGE_DIR ?? path.join(process.cwd(), '.data', 'files'),
    process.env.HUB_BASE_URL ?? 'http://localhost:3000',
    process.env.BETTER_AUTH_SECRET ?? 'dev-secret',
  );
}

export function atlasNotifier(): AtlasNotifier | undefined {
  const baseUrl = process.env.ATLAS_BASE_URL;
  const secret = process.env.ATLAS_REVALIDATE_SECRET;
  return baseUrl && secret ? { baseUrl, secret } : undefined;
}
