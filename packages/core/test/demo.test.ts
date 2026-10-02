import { describe, expect, it } from 'vitest';
import { eq, inArray } from 'drizzle-orm';
import { atlasTables as a } from '@nexture/db';
import { getAtlasStatus } from '../src/atlas';
import { listEvents } from '../src/content/events';
import { createDemoOrg } from '../src/demo';
import { createCorpDemos } from '../src/demo-corps';
import { listMembers } from '../src/members';
import { getOrg } from '../src/orgs';
import { db, makeUser } from './helpers';
import { tempStorage } from './helpers-storage';

describe('demo data', () => {
  it('creates a live demo company with data for every screen', async () => {
    const u = await makeUser('Người thử');
    u.ctx.storage = await tempStorage();
    const { orgId } = await createDemoOrg(u.ctx);

    const org = await getOrg(u.ctx, orgId);
    expect(org.myRole).toBe('ADMIN');
    expect(org.atlasEnabled).toBe(true);
    expect(org.logo).not.toBeNull();
    expect(Object.values(org.onboarding).every(Boolean)).toBe(true);

    const events = await listEvents(u.ctx, orgId, { pageSize: 50 });
    const states = new Set(events.items.map((e) => `${e.status}/${e.visibility}`));
    expect(states).toContain('VERIFIED/PUBLIC');
    expect(states).toContain('PENDING_REVIEW/INTERNAL');
    expect(states).toContain('DRAFT/PRIVATE');

    const status = await getAtlasStatus(u.ctx, orgId);
    expect(status.counts.live.events).toBe(6);
    const [company] = await db.select().from(a.companies).where(eq(a.companies.orgId, orgId));
    expect(company?.logoUrl).toContain('/api/files/public/');
    expect(company?.cultureValues.map((v) => v.name)).not.toContain('Minh bạch'); // INTERNAL value stays off Atlas
    const entities = await db.select().from(a.entities).where(eq(a.entities.orgId, orgId));
    expect(JSON.stringify(entities)).not.toContain('Tiền thuê'); // internal notes never leak

    const members = await listMembers(u.ctx, orgId);
    expect(members.items.length).toBe(3);

    const second = await createDemoOrg(u.ctx); // repeatable: new org, demo users reused
    expect(second.orgId).not.toBe(orgId);
  });
});

describe('three-corporation demo (Vinamilk, FPT, Vingroup)', () => {
  it('creates three live bilingual profiles where every public item cites a source', async () => {
    const u = await makeUser('Corps');
    u.ctx.storage = await tempStorage();
    const { orgIds } = await createCorpDemos(u.ctx);
    expect(orgIds).toHaveLength(3);
    const companies = await db.select().from(a.companies).where(inArray(a.companies.orgId, orgIds));
    expect(companies.map((c) => c.name).sort()).toEqual(['FPT (Demo)', 'Vinamilk (Demo)', 'Vingroup (Demo)']);
    for (const c of companies) {
      expect(c.en.shortDesc).toBeTruthy();
      expect(c.en.cultureValues?.length).toBeGreaterThan(3);
      expect(c.featuredStorySlug).toBeTruthy();
    }
    const entities = await db.select().from(a.entities).where(inArray(a.entities.orgId, orgIds));
    expect(entities.length).toBeGreaterThan(80);
    for (const e of entities) {
      expect(e.sources.length, e.title).toBeGreaterThan(0);
      if (e.entityType !== 'PERSON') expect(e.en.title, e.title).toBeTruthy();
    }
    const founding = entities.find((e) => e.entityType === 'EVENT' && e.companyName === 'FPT (Demo)' && e.sortDate === '1988-09-13');
    expect(founding?.en.subtitle).toBe('Founding');
  });
});
