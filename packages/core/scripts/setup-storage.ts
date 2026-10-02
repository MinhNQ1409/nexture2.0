// Deploy step: makes sure both R2 buckets exist and the private bucket accepts browser uploads (CORS).
// Idempotent. Skipped when no S3 credentials are configured. Usage: pnpm --filter @nexture/core setup-storage
import { CreateBucketCommand, HeadBucketCommand, PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

const env = process.env;
const endpoint = env.S3_ENDPOINT || (env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');
if (!endpoint || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
  console.log('setup-storage: no S3 credentials, skipped');
  process.exit(0);
}
const client = new S3Client({
  region: 'auto',
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});
const privateBucket = env.R2_PRIVATE_BUCKET ?? 'nexture-private';
const publicBucket = env.R2_PUBLIC_BUCKET ?? 'nexture-public';

for (const Bucket of [privateBucket, publicBucket]) {
  try {
    await client.send(new HeadBucketCommand({ Bucket }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket }));
    console.log(`setup-storage: created ${Bucket}`);
  }
}
const origin = (env.HUB_BASE_URL ?? '').replace(/\/$/, '');
try {
  await client.send(
    new PutBucketCorsCommand({
      Bucket: privateBucket,
      CORSConfiguration: {
        CORSRules: [{ AllowedOrigins: [origin || '*'], AllowedMethods: ['PUT', 'GET', 'HEAD'], AllowedHeaders: ['*'], MaxAgeSeconds: 3600 }],
      },
    }),
  );
  console.log(`setup-storage: CORS on ${privateBucket} allows ${origin || '*'}`);
} catch (e) {
  // Object-only tokens cannot set CORS; the build must not fail for it.
  console.warn(`setup-storage: could not set CORS (${(e as Error).name}); set it in the Cloudflare dashboard`);
}
