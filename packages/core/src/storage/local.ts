// Local-disk storage for development and tests. Files live under `root/private` and `root/public`;
// the Hub serves them at /api/files/... and checks the HMAC signature on private PUT/GET.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import type { Storage } from './index';

const sign = (secret: string, method: string, key: string, exp: number) => createHmac('sha256', secret).update(`${method}\n${key}\n${exp}`).digest('base64url');

export function verifyLocalSignature(secret: string, method: string, key: string, exp: string | null, sig: string | null): boolean {
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const expected = Buffer.from(sign(secret, method, key, Number(exp)));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export class LocalStorage implements Storage {
  constructor(
    private root: string,
    private baseUrl: string,
    private secret: string,
  ) {}

  /** Absolute path of a stored file; rejects keys that try to escape the root. */
  filePath(scope: 'private' | 'public', key: string) {
    const base = path.resolve(this.root, scope);
    const p = path.resolve(base, key);
    if (!p.startsWith(base + path.sep)) throw new Error('invalid key');
    return p;
  }

  private signed(method: string, key: string, ttl: number) {
    const exp = Math.floor(Date.now() / 1000) + ttl;
    return `${this.baseUrl.replace(/\/$/, '')}/api/files/private/${key}?exp=${exp}&sig=${sign(this.secret, method, key, exp)}`;
  }

  async presignPut(key: string, mimeType: string) {
    return { url: this.signed('PUT', key, 900), headers: { 'Content-Type': mimeType } };
  }

  async presignGet(key: string) {
    return this.signed('GET', key, 3600);
  }

  async head(key: string) {
    try {
      return { size: (await stat(this.filePath('private', key))).size };
    } catch {
      return null;
    }
  }

  async copyToPublic(privateKey: string, publicKey: string) {
    const to = this.filePath('public', publicKey);
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(this.filePath('private', privateKey), to);
  }

  async deletePublic(publicKey: string) {
    await rm(this.filePath('public', publicKey), { force: true });
  }

  async readPublic(publicKey: string) {
    try {
      return await readFile(this.filePath('public', publicKey));
    } catch {
      return null;
    }
  }

  publicUrl(publicKey: string) {
    return `${this.baseUrl.replace(/\/$/, '')}/api/files/public/${publicKey}`;
  }
}
