import { describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { atlasTables as a, coreTables as t } from '@nexture/db';
import { setAtlasEnabled } from '../src/atlas';
import { createDemoOrg } from '../src/demo';
import { createPerson, getPerson, listPeople, updatePerson } from '../src/content/people';
import { createProduct, listProducts, updateProduct } from '../src/content/products';
import { createStory, deleteStory, getStory, listStories, updateStory } from '../src/content/stories';
import { setVisibility, transition } from '../src/content/workflow';
import { createOrg, updateOrg } from '../src/orgs';
import { db, expectError, makeUser } from './helpers';
import { tempStorage, uploadImage } from './helpers-storage';

async function liveOrg() {
  const admin = await makeUser('Admin');
  admin.ctx.storage = await tempStorage();
  const org = await createOrg(admin.ctx, {
    name: `Kinds ${admin.id.slice(-6)}`,
    foundedYear: 2012,
    industryCode: 'FNB',
    provinceCode: 'ha-noi',
    shortDescVi: 'Doanh nghiệp thử nghiệm.',
  });
  const logo = await uploadImage(admin.ctx, org.id);
  const o2 = await updateOrg(admin.ctx, org.id, { version: org.version, logoMediaId: logo });
  await setAtlasEnabled(admin.ctx, org.id, { enabled: true });
  return { admin, org: o2 };
}

process.env.ATLAS_BASE_URL ??= 'http://atlas.test';

const entity = async (id: string) => (await db.select().from(a.entities).where(eq(a.entities.id, id)))[0];

describe('stories', () => {
  it('needs summary and content to submit; publishes with label subtitle; featured story reaches the company', async () => {
    const { admin, org } = await liveOrg();
    let s = await createStory(admin.ctx, org.id, { storyType: 'COMPANY', titleVi: 'Hành trình mười năm', internalNotes: 'SECRET-S' });
    expect(s.storyType).toBe('COMPANY');
    await expectError(transition(admin.ctx, 'stories', org.id, s.id, 'submit', { version: s.version }), 'REQUIRED_FOR_REVIEW');
    await expectError(createStory(admin.ctx, org.id, { titleVi: 'Thiếu', status: 'VERIFIED' }), 'REQUIRED_FOR_REVIEW');

    s = await updateStory(admin.ctx, org.id, s.id, { version: s.version, summaryVi: 'Tóm tắt', contentVi: '<p>Nội dung</p>', storyDate: { date: '2016-05-09', precision: 'YEAR' } });
    expect(s.storyDate).toEqual({ date: '2016-01-01', precision: 'YEAR' });
    s = await transition(admin.ctx, 'stories', org.id, s.id, 'approve', { version: s.version });
    s = await setVisibility(admin.ctx, 'stories', org.id, s.id, { version: s.version, visibility: 'PUBLIC' });
    expect(s.publicState).toBe('LIVE');

    const pub = await entity(s.id);
    expect(pub).toMatchObject({ entityType: 'STORY', slug: 'hanh-trinh-muoi-nam', subtitle: 'Câu chuyện doanh nghiệp', summary: 'Tóm tắt' });
    expect(JSON.stringify(pub)).not.toContain('SECRET-S');

    const [o] = await db.select().from(t.organizations).where(eq(t.organizations.id, org.id));
    await updateOrg(admin.ctx, org.id, { version: o!.version, featuredStoryId: s.id });
    const [company] = await db.select().from(a.companies).where(eq(a.companies.orgId, org.id));
    expect(company?.featuredStorySlug).toBe('hanh-trinh-muoi-nam');

    // Admin edit of a verified story cannot drop a required field.
    await expectError(updateStory(admin.ctx, org.id, s.id, { version: s.version, summaryVi: '' }), 'REQUIRED_FOR_REVIEW');

    await deleteStory(admin.ctx, org.id, s.id);
    expect(await entity(s.id)).toBeUndefined();
    const [tomb] = await db.select().from(a.tombstones).where(eq(a.tombstones.path, '/stories/hanh-trinh-muoi-nam'));
    expect(tomb).toBeDefined();
    const [c2] = await db.select().from(a.companies).where(eq(a.companies.orgId, org.id));
    expect(c2?.featuredStorySlug).toBeNull();
  });

  it('filters by type and searches without accents', async () => {
    const { admin, org } = await liveOrg();
    await createStory(admin.ctx, org.id, { storyType: 'FOUNDER', titleVi: 'Người gieo hạt' });
    await createStory(admin.ctx, org.id, { storyType: 'CULTURE', titleVi: 'Bữa trưa thứ sáu' });
    expect((await listStories(admin.ctx, org.id, { storyType: 'FOUNDER' })).items.map((i) => i.title)).toEqual(['Người gieo hạt']);
    expect((await listStories(admin.ctx, org.id, { q: 'bua trua' })).items.map((i) => i.subtitle)).toEqual(['Câu chuyện văn hóa']);
  });
});

describe('people', () => {
  it('requires a role to verify, validates dates, projects founder flag and contributions, never internal notes', async () => {
    const { admin, org } = await liveOrg();
    await expectError(
      createPerson(admin.ctx, org.id, { fullName: 'Ngày Sai', joinedDate: { date: '2020-01-01', precision: 'YEAR' }, leftDate: { date: '2019-01-01', precision: 'YEAR' } }),
      'VALIDATION_FAILED',
    );
    let p = await createPerson(admin.ctx, org.id, { fullName: 'Trần Thu Hà', isFounder: true, internalNotes: 'SECRET-P', contributionsVi: 'Xây quy trình rang' });
    await expectError(transition(admin.ctx, 'people', org.id, p.id, 'approve', { version: p.version }), 'REQUIRED_FOR_REVIEW');
    p = await updatePerson(admin.ctx, org.id, p.id, { version: p.version, roleTitleVi: 'Đồng sáng lập', joinedDate: { date: '2016-03-01', precision: 'MONTH' } });
    p = await transition(admin.ctx, 'people', org.id, p.id, 'approve', { version: p.version });
    p = await setVisibility(admin.ctx, 'people', org.id, p.id, { version: p.version, visibility: 'PUBLIC' });

    const pub = await entity(p.id);
    expect(pub).toMatchObject({ entityType: 'PERSON', title: 'Trần Thu Hà', subtitle: 'Đồng sáng lập', summary: null, sortDate: '2016-03-01' });
    expect(pub?.extra).toEqual({ isFounder: true, contributionsHtml: 'Xây quy trình rang' });
    expect(JSON.stringify(pub)).not.toContain('SECRET-P');
    expect(p.publicUrl).toMatch(/\/people\/tran-thu-ha$/);

    await createPerson(admin.ctx, org.id, { fullName: 'An Nhân Viên' });
    expect((await listPeople(admin.ctx, org.id)).items.map((i) => i.title)).toEqual(['Trần Thu Hà', 'An Nhân Viên']);
    expect((await listPeople(admin.ctx, org.id, { founder: '1' })).total).toBe(1);
  });

  it('viewer sees verified internal people only, without internal notes', async () => {
    const { admin, org } = await liveOrg();
    const viewer = await makeUser('Viewer');
    await db.insert(t.organizationMembers).values({ organizationId: org.id, userId: viewer.id, role: 'VIEWER' });
    const draft = await createPerson(admin.ctx, org.id, { fullName: 'Nháp' });
    const ok = await createPerson(admin.ctx, org.id, { fullName: 'Đã xác minh', roleTitleVi: 'Barista', status: 'VERIFIED', internalNotes: 'SECRET-V' });
    expect((await listPeople(viewer.ctx, org.id)).items.map((i) => i.id)).toEqual([ok.id]);
    await expectError(getPerson(viewer.ctx, org.id, draft.id), 'NOT_FOUND');
    expect((await getPerson(viewer.ctx, org.id, ok.id)).internalNotes).toBeNull();
  });
});

describe('products and projects', () => {
  it('needs a summary; switching kind moves the Atlas type to the project path without a tombstone', async () => {
    const { admin, org } = await liveOrg();
    let p = await createProduct(admin.ctx, org.id, { kind: 'PRODUCT', titleVi: 'Cà phê Tây Bắc' });
    await expectError(transition(admin.ctx, 'products', org.id, p.id, 'approve', { version: p.version }), 'REQUIRED_FOR_REVIEW');
    p = await updateProduct(admin.ctx, org.id, p.id, { version: p.version, summaryVi: 'Arabica Sơn La', launchDate: { date: '2018-01-01', precision: 'YEAR' } });
    p = await transition(admin.ctx, 'products', org.id, p.id, 'approve', { version: p.version });
    p = await setVisibility(admin.ctx, 'products', org.id, p.id, { version: p.version, visibility: 'PUBLIC' });
    expect(await entity(p.id)).toMatchObject({ entityType: 'PRODUCT', slug: 'ca-phe-tay-bac', subtitle: 'Sản phẩm', extra: { status: 'ACTIVE' } });

    p = await updateProduct(admin.ctx, org.id, p.id, { version: p.version, kind: 'PROJECT', ppStatus: 'COMPLETED' });
    expect(await entity(p.id)).toMatchObject({ entityType: 'PROJECT', slug: 'ca-phe-tay-bac', subtitle: 'Dự án', extra: { status: 'COMPLETED' } });
    expect(p.publicUrl).toMatch(/\/projects\/ca-phe-tay-bac$/);
    const tombs = await db.select().from(a.tombstones).where(eq(a.tombstones.path, '/products/ca-phe-tay-bac'));
    expect(tombs).toHaveLength(0);
    expect((await listProducts(admin.ctx, org.id, { kind: 'PROJECT' })).total).toBe(1);
  });
});

describe('demo company on Atlas', () => {
  it('publishes stories, people and products with relations between public items', async () => {
    const admin = await makeUser('Demo');
    admin.ctx.storage = await tempStorage();
    const { orgId } = await createDemoOrg(admin.ctx);
    const rows = await db.select({ type: a.entities.entityType }).from(a.entities).where(eq(a.entities.orgId, orgId));
    const types = new Set(rows.map((r) => r.type));
    for (const ty of ['STORY', 'EVENT', 'PERSON']) expect(types.has(ty)).toBe(true);
    expect(types.has('PRODUCT') || types.has('PROJECT')).toBe(true);
    const [company] = await db.select().from(a.companies).where(eq(a.companies.orgId, orgId));
    expect(company?.featuredStorySlug).toBeTruthy();
    const people = rows.filter((r) => r.type === 'PERSON');
    expect(people.length).toBeGreaterThan(0);
    const rel = await db
      .select()
      .from(a.relations)
      .innerJoin(a.entities, eq(a.entities.id, a.relations.fromId))
      .where(and(eq(a.entities.orgId, orgId), eq(a.entities.entityType, 'PERSON')));
    expect(rel.length).toBeGreaterThan(0);
    // Related items are filled in on the Hub DTO.
    const stories = await listStories(admin.ctx, orgId);
    const s = await getStory(admin.ctx, orgId, stories.items[0]!.id);
    expect(s.related).toBeDefined();
  });
});
