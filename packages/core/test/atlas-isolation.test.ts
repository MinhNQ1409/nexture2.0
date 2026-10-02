import { describe, expect, it, inject } from 'vitest';
import pg from 'pg';

describe('atlas_reader role', () => {
  it('reads schema atlas but is denied on schema core', async () => {
    const client = new pg.Client({ connectionString: inject('atlasDbUrl') });
    await client.connect();
    try {
      await expect(client.query('SELECT count(*) FROM atlas.companies')).resolves.toBeTruthy();
      expect((await client.query("SELECT atlas.f_search_norm('Đổi mới Nguyễn') AS s")).rows[0].s).toBe('doi moi nguyen');
      await expect(client.query('SELECT 1 FROM core.stories LIMIT 1')).rejects.toThrow(/permission denied/);
      await expect(client.query('SELECT 1 FROM core."user" LIMIT 1')).rejects.toThrow(/permission denied/);
      await expect(client.query("INSERT INTO atlas.tombstones(path, removed_at) VALUES ('/x', now())")).rejects.toThrow(/permission denied/);
    } finally {
      await client.end();
    }
  });
});
