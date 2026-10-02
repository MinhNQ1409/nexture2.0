import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as coreSchema from './core-schema';
import * as atlasSchema from './atlas-schema';

// atlas tables are prefixed so names never collide with core (both have entityMedia).
const atlasPrefixed = Object.fromEntries(
  Object.entries(atlasSchema).map(([k, v]) => [`atlas_${k}`, v]),
) as { [K in keyof typeof atlasSchema as `atlas_${K & string}`]: (typeof atlasSchema)[K] };
export const schema = { ...coreSchema, ...atlasPrefixed };
export type Db = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

const globalForDb = globalThis as unknown as { __nextureDb?: Map<string, { pool: pg.Pool; db: Db }> };

/** One pool per connection string, reused across hot reloads. */
export function getDb(connectionString: string): Db {
  globalForDb.__nextureDb ??= new Map();
  let entry = globalForDb.__nextureDb.get(connectionString);
  if (!entry) {
    const pool = new pg.Pool({ connectionString, max: 10 });
    entry = { pool, db: drizzle(pool, { schema }) };
    globalForDb.__nextureDb.set(connectionString, entry);
  }
  return entry.db;
}

export async function closeAllDbs(): Promise<void> {
  const map = globalForDb.__nextureDb;
  if (!map) return;
  await Promise.all([...map.values()].map((e) => e.pool.end()));
  map.clear();
}
