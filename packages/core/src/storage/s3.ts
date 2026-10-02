import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Storage } from './index';

export type S3Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  privateBucket: string;
  publicBucket: string;
  publicBaseUrl: string;
};

export class S3Storage implements Storage {
  private client: S3Client;
  constructor(private cfg: S3Config) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: cfg.endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    });
  }

  async presignPut(key: string, mimeType: string) {
    const url = await getSignedUrl(this.client, new PutObjectCommand({ Bucket: this.cfg.privateBucket, Key: key, ContentType: mimeType }), { expiresIn: 900 });
    return { url, headers: { 'Content-Type': mimeType } };
  }

  async putPrivate(key: string, body: Uint8Array, mimeType: string) {
    await this.client.send(new PutObjectCommand({ Bucket: this.cfg.privateBucket, Key: key, Body: body, ContentType: mimeType }));
  }

  /** Signed in 30-minute windows so the URL stays identical between page loads and the browser can cache the image. */
  presignGet(key: string) {
    const window = 30 * 60 * 1000;
    const signingDate = new Date(Math.floor(Date.now() / window) * window);
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.cfg.privateBucket, Key: key, ResponseCacheControl: 'private, max-age=1800' }), { expiresIn: 3600, signingDate });
  }

  async head(key: string) {
    try {
      const r = await this.client.send(new HeadObjectCommand({ Bucket: this.cfg.privateBucket, Key: key }));
      return { size: r.ContentLength ?? 0 };
    } catch (e) {
      if ((e as { name?: string }).name === 'NotFound') return null;
      throw e;
    }
  }

  async copyToPublic(privateKey: string, publicKey: string) {
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.cfg.publicBucket,
        Key: publicKey,
        CopySource: `${this.cfg.privateBucket}/${encodeURI(privateKey)}`,
        CacheControl: 'public, max-age=31536000, immutable',
        MetadataDirective: 'REPLACE',
      }),
    );
  }

  async deletePublic(publicKey: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.cfg.publicBucket, Key: publicKey }));
  }

  async deletePrivate(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.cfg.privateBucket, Key: key }));
  }

  async readPublic(publicKey: string) {
    try {
      const r = await this.client.send(new GetObjectCommand({ Bucket: this.cfg.publicBucket, Key: publicKey }));
      return r.Body ? await r.Body.transformToByteArray() : null;
    } catch (e) {
      if ((e as { name?: string }).name === 'NoSuchKey') return null;
      throw e;
    }
  }

  publicUrl(publicKey: string) {
    return `${this.cfg.publicBaseUrl.replace(/\/$/, '')}/${publicKey}`;
  }
}
