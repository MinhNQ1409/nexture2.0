import { afterAll, inject } from 'vitest';
import { uuidv7 } from 'uuidv7';
import { closeAllDbs, coreTables as t, getDb } from '@nexture/db';
import type { Ctx } from '../src/context';

export const db = getDb(inject('appDbUrl'));
afterAll(closeAllDbs);

/** Inserts a user directly (Better Auth is not involved in core tests). */
export async function makeUser(name = 'Người dùng', platformRole: 'USER' | 'NEXTURE_ADMIN' = 'USER') {
  const id = uuidv7();
  const email = `${id}@test.local`;
  await db.insert(t.user).values({ id, name, email, platformRole });
  const ctx: Ctx = { db, actor: { userId: id, platformRole } };
  return { id, email, ctx };
}

export async function expectError(p: Promise<unknown>, code: string) {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  );
  if (!err || (err as { code?: string }).code !== code) {
    throw new Error(`expected ${code}, got ${err ? ((err as { code?: string }).code ?? String(err)) : 'success'}`);
  }
}
