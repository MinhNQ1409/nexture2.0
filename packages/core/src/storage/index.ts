// File storage behind one interface: S3-compatible (Cloudflare R2, MinIO) in real environments,
// local disk for development/tests without an object store. docs/spec/05-api-ghi-chu.md §5.
export interface Storage {
  /** Presigned PUT the browser uploads to directly (15 minutes). */
  presignPut(key: string, mimeType: string): Promise<{ url: string; headers: Record<string, string> }>;
  /** Presigned GET for private files (60 minutes). */
  presignGet(key: string): Promise<string>;
  /** Size of an uploaded private object, or null when missing. */
  head(key: string): Promise<{ size: number } | null>;
  /** Copies a private object into the public bucket. */
  copyToPublic(privateKey: string, publicKey: string): Promise<void>;
  deletePublic(publicKey: string): Promise<void>;
  publicUrl(publicKey: string): string;
}

export { S3Storage } from './s3';
export { LocalStorage, verifyLocalSignature } from './local';
