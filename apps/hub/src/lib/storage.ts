import 'server-only';
import path from 'node:path';
import { LocalStorage, S3Storage, type AtlasNotifier, type Storage } from '@nexture/core';

let cached: Storage | undefined;

/** S3-compatible storage (R2, MinIO) when S3_ENDPOINT is set; otherwise files on local disk (dev, demo on one machine). */
export function storage(): Storage {
  if (cached) return cached;
  const env = process.env;
  // R2: endpoint derives from the account id; public files are served through the Hub unless a public domain is set.
  const endpoint = env.S3_ENDPOINT || (env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');
  cached = endpoint
    ? new S3Storage({
        endpoint,
        accessKeyId: env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? '',
        privateBucket: env.R2_PRIVATE_BUCKET ?? 'nexture-private',
        publicBucket: env.R2_PUBLIC_BUCKET ?? 'nexture-public',
        publicBaseUrl: env.R2_PUBLIC_BASE_URL || `${env.HUB_BASE_URL ?? ''}/api/files/public`,
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
