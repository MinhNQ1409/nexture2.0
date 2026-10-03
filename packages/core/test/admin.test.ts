import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { atlasTables as a, coreTables as t } from '@nexture/db';
import { adminDeleteOrg, adminGetOrg, adminHide, adminListOrgs, adminLockOrg, adminUnhide, adminUnlockOrg } from '../src/admin';
import { setAtlasEnabled } from '../src/atlas';
import { createEvent, getEvent, listEvents } from '../src/content/events';
import { addSource, removeSource, updateSource } from '../src/content/sources';
import { setVisibility } from '../src/content/workflow';
import { getMe } from '../src/me';
import { createOrg, getOrg, updateOrg } from '../src/orgs';
import { publicPreview } from '../src/public/preview';
import { searchOrg } from '../src/views';
import { db, expectError, makeUser } from './helpers';
import { tempStorage, uploadImage } from './helpers-storage';

process.env.ATLAS_BASE_URL ??= 'http://atlas.test';

async function setup() {
  const admin = await makeUser('Admin');
  admin.ctx.storage = await tempStorage();
  const org = await createOrg(admin.ctx, { name: `Quản trị ${admin.id.slice(-6)}`, foundedYear: 2010, industryCode: 'FNB', provinceCode: 'ha-noi', shortDescVi: 'Thử khu NexTure.' });
  const logo = await uploadImage(admin.ctx, org.id);
  await updateOrg(admin.ctx, org.id, { version: org.version, logoMediaId: logo });
  await setAtlasEnabled(admin.ctx, org.id, { enabled: true });
  let ev = await createEvent(admin.ctx, org.id, { titleVi: 'Mở cửa hàng đầu tiên', startDate: { date: '2012-05-01', precision: 'MONTH' }, summaryVi: 'Khởi đầu', status: 'VERIFIED' });
  ev = await setVisibility(admin.ctx, 'events', org.id, ev.id, { version: ev.version, visibility: 'PUBLIC' });
  const nexture = await makeUser('NexTure', 'NEXTURE_ADMIN');
  nexture.ctx.storage = admin.ctx.storage;
  return { admin, org, ev, nexture };
}
const entity = async (id: string) => (await db.select().from(a.entities).where(eq(a.entities.id, id)))[0];
const company = async (orgId: string) => (await db.select().from(a.companies).where(eq(a.companies.orgId, orgId)))[0];

describe('sources', () => {
  it('only public sources reach Atlas, library files show their title only', async () => {
    const { admin, org, ev } = await setup();
    const doc = await uploadImage(admin.ctx, org.id, 'bai-bao.png');
    let e = await addSource(admin.ctx, 'events', org.id, ev.id, { title: 'Báo Tuổi Trẻ', url: 'https://tuoitre.vn/a', note: 'Trang 3', isPublic: true });
    e = await addSource(admin.ctx, 'events', org.id, ev.id, { title: 'Ảnh scan', mediaId: doc, isPublic: false });
    expect(e.sources.map((s) => s.title)).toEqual(['Báo Tuổi Trẻ', 'Ảnh scan']);
    expect((await entity(ev.id))?.sources).toEqual([{ title: 'Báo Tuổi Trẻ', url: 'https://tuoitre.vn/a', note: 'Trang 3' }]);

    const scan = e.sources[1]!;
    e = await updateSource(admin.ctx, 'events', org.id, ev.id, scan.id, { isPublic: true });
    expect((await entity(ev.id))?.sources[1]).toEqual({ title: 'Ảnh scan', url: null, note: null });
    e = await removeSource(admin.ctx, 'events', org.id, ev.id, e.sources[0]!.id);
    expect((await entity(ev.id))?.sources.map((s) => s.title)).toEqual(['Ảnh scan']);

    await expectError(addSource(admin.ctx, 'events', org.id, ev.id, { title: 'Thiếu' }), 'VALIDATION_FAILED');
    await expectError(addSource(admin.ctx, 'events', org.id, ev.id, { title: 'Cả hai', url: 'https://x.vn', mediaId: doc }), 'VALIDATION_FAILED');
  });
});

describe('public preview', () => {
  it('shows a draft as Atlas would, with warnings, and writes nothing', async () => {
    const { admin, org } = await setup();
    const draft = await createEvent(admin.ctx, org.id, { titleVi: 'Ra mắt sản phẩm mới', startDate: { date: '2020-01-01', precision: 'YEAR' }, contentVi: '<p>Nội dung</p>', internalNotes: 'bí mật' });
    const p = await publicPreview(admin.ctx, 'events', org.id, draft.id);
    expect(p.title).toBe('Ra mắt sản phẩm mới');
    expect(p.path).toBe('/events/ra-mat-san-pham-moi');
    expect(p.url).toBe('http://atlas.test/events/ra-mat-san-pham-moi');
    expect(p.warnings.join(' ')).toMatch(/chưa được xác minh/);
    expect(JSON.stringify(p)).not.toContain('bí mật');
    expect(await entity(draft.id)).toBeUndefined();
    expect((await getEvent(admin.ctx, org.id, draft.id)).visibility).toBe('INTERNAL');
  });
});

describe('year filter', () => {
  it('filters content and search by year', async () => {
    const { admin, org } = await setup();
    await createEvent(admin.ctx, org.id, { titleVi: 'Mốc năm 2019', startDate: { date: '2019-01-01', precision: 'YEAR' } });
    const years = async (q: Record<string, string>) => (await listEvents(admin.ctx, org.id, q)).items.map((i) => i.title).sort();
    expect(await years({ yearFrom: '2015' })).toEqual(['Mốc năm 2019']);
    expect(await years({ yearTo: '2015' })).toEqual(['Mở cửa hàng đầu tiên']);
    expect(await years({ yearFrom: 'abc' })).toHaveLength(2);
    const r = await searchOrg(admin.ctx, org.id, { q: 'moc', yearFrom: '2018', yearTo: '2019' });
    expect(r.groups[0]?.items.map((i) => i.title)).toEqual(['Mốc năm 2019']);
  });
});

describe('nexture admin', () => {
  it('is invisible to normal users', async () => {
    const { admin, org } = await setup();
    await expectError(adminListOrgs(admin.ctx), 'NOT_FOUND');
    await expectError(adminGetOrg(admin.ctx, org.id), 'NOT_FOUND');
  });

  it('lists companies and hides/unhides one item with a reason the company sees', async () => {
    const { admin, org, ev, nexture } = await setup();
    const list = await adminListOrgs(nexture.ctx, { q: org.slug });
    expect(list.items).toEqual([expect.objectContaining({ id: org.id, atlas: 'ON', memberCount: 1, liveCount: 1 })]);
    let detail = await adminGetOrg(nexture.ctx, org.id);
    expect(detail.items).toEqual([expect.objectContaining({ id: ev.id, state: 'LIVE', atlasUrl: expect.stringMatching(/\/events\//) })]);

    await expectError(adminHide(nexture.ctx, { targetType: 'EVENT', targetId: ev.id, reason: 'ngắn' }), 'VALIDATION_FAILED');
    await adminHide(nexture.ctx, { targetType: 'EVENT', targetId: ev.id, reason: 'Nội dung chưa kiểm chứng' });
    expect(await entity(ev.id)).toBeUndefined();
    const seen = await getEvent(admin.ctx, org.id, ev.id);
    expect(seen.publicState).toBe('HIDDEN_BY_NEXTURE');
    expect(seen.atlasHiddenReason).toBe('Nội dung chưa kiểm chứng');
    // The company toggling visibility does not bring it back.
    const v = await setVisibility(admin.ctx, 'events', org.id, ev.id, { version: seen.version, visibility: 'INTERNAL' });
    await setVisibility(admin.ctx, 'events', org.id, ev.id, { version: v.version, visibility: 'PUBLIC' });
    expect(await entity(ev.id)).toBeUndefined();

    await adminUnhide(nexture.ctx, { targetType: 'EVENT', targetId: ev.id });
    expect(await entity(ev.id)).toBeDefined();
    detail = await adminGetOrg(nexture.ctx, org.id);
    expect(detail.items[0]?.state).toBe('LIVE');
  });

  it('hides a whole company profile', async () => {
    const { org, ev, nexture } = await setup();
    await adminHide(nexture.ctx, { targetType: 'ORGANIZATION', targetId: org.id, reason: 'Hồ sơ đang xác minh' });
    expect(await company(org.id)).toBeUndefined();
    expect(await entity(ev.id)).toBeUndefined();
    const tomb = await db.select().from(a.tombstones).where(eq(a.tombstones.path, `/companies/${org.slug}`));
    expect(tomb).toHaveLength(1);
    await adminUnhide(nexture.ctx, { targetType: 'ORGANIZATION', targetId: org.id });
    expect(await company(org.id)).toBeDefined();
    expect(await entity(ev.id)).toBeDefined();
  });

  it('locks a company: members are shut out and the profile leaves Atlas', async () => {
    const { admin, org, nexture } = await setup();
    const d = await adminLockOrg(nexture.ctx, org.id, { reason: 'Vi phạm điều khoản sử dụng' });
    expect(d.lockedReason).toBe('Vi phạm điều khoản sử dụng');
    expect(d.atlas).toBe('HIDDEN');
    await expectError(getOrg(admin.ctx, org.id), 'ORG_LOCKED');
    expect((await getMe(admin.ctx)).organizations.find((o) => o.id === org.id)?.lockedAt).toBeTruthy();
    expect(await company(org.id)).toBeUndefined();

    await adminUnlockOrg(nexture.ctx, org.id);
    expect((await getOrg(admin.ctx, org.id)).id).toBe(org.id);
    expect(await company(org.id)).toBeUndefined(); // still hidden until NexTure unhides
    await adminUnhide(nexture.ctx, { targetType: 'ORGANIZATION', targetId: org.id });
    expect(await company(org.id)).toBeDefined();
  });

  it('never deletes the company named NexTure', async () => {
    const owner = await makeUser('Chủ');
    const nexture = await makeUser('NexTure', 'NEXTURE_ADMIN');
    const own = await createOrg(owner.ctx, { name: ' NexTure ' });
    await expectError(adminDeleteOrg(nexture.ctx, own.id, { confirmSlug: own.slug }), 'ORG_PROTECTED');
    expect((await getOrg(owner.ctx, own.id)).id).toBe(own.id);
  });

  it('deletes a company and all its data after the slug is retyped', async () => {
    const { admin, org, ev, nexture } = await setup();
    await addSource(admin.ctx, 'events', org.id, ev.id, { title: 'Nguồn', url: 'https://x.vn', isPublic: true });
    await expectError(adminDeleteOrg(nexture.ctx, org.id, { confirmSlug: 'sai' }), 'VALIDATION_FAILED');
    await adminDeleteOrg(nexture.ctx, org.id, { confirmSlug: org.slug });
    expect(await db.select().from(t.organizations).where(eq(t.organizations.id, org.id))).toHaveLength(0);
    expect(await db.select().from(t.events).where(eq(t.events.organizationId, org.id))).toHaveLength(0);
    expect(await db.select().from(t.mediaAssets).where(eq(t.mediaAssets.organizationId, org.id))).toHaveLength(0);
    expect(await company(org.id)).toBeUndefined();
    expect(await db.select().from(a.media).where(eq(a.media.orgId, org.id))).toHaveLength(0);
    expect(await db.select().from(a.tombstones).where(eq(a.tombstones.path, `/companies/${org.slug}`))).toHaveLength(1);
    expect((await getMe(admin.ctx)).organizations).toHaveLength(0);
    await expectError(adminGetOrg(nexture.ctx, org.id), 'NOT_FOUND');
  });
});
