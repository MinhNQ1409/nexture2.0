// Creates a fresh database `nexture_test` and applies migrations.
// TEST_DATABASE_URL must point at a superuser connection (default: local docker-compose Postgres).
import pg from 'pg';
import type { TestProject } from 'vitest/node';
import { migrate } from '@nexture/db/migrate';

declare module 'vitest' {
  export interface ProvidedContext {
    appDbUrl: string;
    atlasDbUrl: string;
  }
}

const DB = 'nexture_test';

export default async function setup(project: TestProject) {
  const admin = new URL(process.env.TEST_DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres');
  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  await client.query(`DROP DATABASE IF EXISTS ${DB} WITH (FORCE)`);
  await client.query(`CREATE DATABASE ${DB}`);
  await client.end();

  const owner = new URL(admin);
  owner.pathname = `/${DB}`;
  await migrate(owner.toString(), { appPassword: 'nexture_app', atlasPassword: 'atlas_reader' });

  const as = (user: string) => {
    const u = new URL(owner);
    u.username = user;
    u.password = user;
    return u.toString();
  };
  project.provide('appDbUrl', as('nexture_app'));
  project.provide('atlasDbUrl', as('atlas_reader'));
}
