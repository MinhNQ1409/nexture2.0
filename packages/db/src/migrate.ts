// Applies sql/*.sql in filename order, tracked in public.nexture_migrations.
// Before migrating, ensures the app and Atlas roles exist (passwords from env).
// Usage: DATABASE_URL_UNPOOLED=... APP_DB_PASSWORD=... ATLAS_DB_PASSWORD=... pnpm db:migrate
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sql');

export async function migrate(connectionString: string, opts: { appPassword?: string; atlasPassword?: string } = {}) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    for (const [role, pw] of [
      ['nexture_app', opts.appPassword],
      ['atlas_reader', opts.atlasPassword],
    ] as const) {
      const exists = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [role]);
      if (exists.rowCount === 0) {
        if (!pw) throw new Error(`Role ${role} does not exist; set its password env var to create it`);
        await client.query(`CREATE ROLE ${role} LOGIN PASSWORD ${client.escapeLiteral(pw)}`);
      }
    }
    await client.query(
      'CREATE TABLE IF NOT EXISTS public.nexture_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const done = await client.query('SELECT 1 FROM public.nexture_migrations WHERE name = $1', [file]);
      if (done.rowCount) continue;
      const sql = await readFile(path.join(dir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO public.nexture_migrations(name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    await client.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const url = process.env.DATABASE_URL_UNPOOLED;
  if (!url) throw new Error('DATABASE_URL_UNPOOLED is required');
  migrate(url, { appPassword: process.env.APP_DB_PASSWORD, atlasPassword: process.env.ATLAS_DB_PASSWORD }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
