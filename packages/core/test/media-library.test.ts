import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { atlasTables as a } from '@nexture/db';
import { setAtlasEnabled } from '../src/atlas';
import { createEvent, getEvent, updateEvent } from '../src/content/events';
import { setEntityMedia } from '../src/content/relations';
import { setVisibility } from '../src/content/workflow';
import { deleteMedia, getMedia, listMedia, mediaTransition, setMediaVisibility, updateMedia } from '../src/media';
import { createOrg, updateOrg } from '../src/orgs';
import { db, expectError, makeUser } from './helpers';
import { tempStorage, uploadImage } from './helpers-storage';

process.env.ATLAS_BASE_URL ??= 'http://atlas.test';
const START = { date: '2015-03-01', precision: 'MONTH' as const };

async function setup() {
  const admin = await makeUser('Admin');
  admin.ctx.storage = await tempStorage();
  const org = await createOrg(admin.ctx, { name: `Media ${admin.id.slice(-6)}`, foundedYear: 2012, industryCode: 'FNB', provinceCode: 'ha-noi', shortDescVi: 'Thử thư viện.' });
  const logo = await uploadImage(admin.ctx, org.id);
  await updateOrg(admin.ctx, org.id, { version: org.version, logoMediaId: logo });
  await setAtlasEnabled(admin.ctx, org.id, { enabled: true });
  let ev = await createEvent(admin.ctx, org.id, { titleVi: 'Khai trương', startDate: START, summaryVi: 'Ngày đầu', status: 'VERIFIED' });
  ev = await setVisibility(admin.ctx, 'events', org.id, ev.id, { version: ev.version, visibility: 'PUBLIC' });
  return { admin, org, ev };
}

async function makePublic(ctx: Parameters<typeof getMedia>[0], orgId: string, id: string) {
  let m = await getMedia(ctx, orgId, id);
  m = await mediaTransition(ctx, orgId, id, 'approve', { version: m.version });
  return setMediaVisibility(ctx, orgId, id, { version: m.version, visibility: 'PUBLIC' });
}

const entity = async (id: string) => (await db.select().from(a.entities).where(eq(a.entities.id, id)))[0];
const atlasMedia = async (id: string) => (await db.select().from(a.media).where(eq(a.media.id, id)))[0];

describe('media library', () => {
  it('cover reaches Atlas only once the media is verified and public, and leaves when removed', async () => {
    const { admin, org, ev } = await setup();
    const img = await uploadImage(admin.ctx, org.id, 'bia.png');
    let e = await updateEvent(admin.ctx, org.id, ev.id, { version: ev.version, coverMediaId: img });
    expect(e.cover?.id).toBe(img);
    expect((await entity(ev.id))?.coverUrl).toBeNull();

    const m = await makePublic(admin.ctx, org.id, img);
    expect(m.publicState).toBe('LIVE');
    expect(m.usedIn).toEqual([expect.objectContaining({ type: 'EVENT', id: ev.id, how: 'COVER' })]);
    expect((await entity(ev.id))?.coverUrl).toMatch(/^http/);
    expect(await atlasMedia(img)).toBeDefined();

    // In use: cannot delete.
    await expectError(deleteMedia(admin.ctx, org.id, img), 'MEDIA_IN_USE');

    e = await getEvent(admin.ctx, org.id, ev.id);
    await updateEvent(admin.ctx, org.id, ev.id, { version: e.version, coverMediaId: null });
    expect((await entity(ev.id))?.coverUrl).toBeNull();
    expect(await atlasMedia(img)).toBeUndefined();
    await deleteMedia(admin.ctx, org.id, img);
    expect((await listMedia(admin.ctx, org.id)).items.map((i) => i.id)).not.toContain(img);
  });

  it('gallery keeps order and captions on Hub; Atlas shows only public items; unverify takes media down', async () => {
    const { admin, org, ev } = await setup();
    const one = await uploadImage(admin.ctx, org.id, 'mot.png');
    const two = await uploadImage(admin.ctx, org.id, 'hai.png');
    await makePublic(admin.ctx, org.id, two);
    const dto = await setEntityMedia(admin.ctx, 'events', org.id, ev.id, {
      items: [
        { mediaId: one, caption: 'Nội bộ' },
        { mediaId: two, caption: 'Ngày khai trương' },
      ],
    });
    expect(dto.media.map((m: { id: string; caption: string; isPublic: boolean }) => [m.id, m.caption, m.isPublic])).toEqual([
      [one, 'Nội bộ', false],
      [two, 'Ngày khai trương', true],
    ]);
    const gal = await db.select().from(a.entityMedia).where(eq(a.entityMedia.entityId, ev.id));
    expect(gal.map((g) => [g.mediaId, g.caption])).toEqual([[two, 'Ngày khai trương']]);

    let m = await getMedia(admin.ctx, org.id, two);
    m = await mediaTransition(admin.ctx, org.id, two, 'unverify', { version: m.version });
    expect(m).toMatchObject({ status: 'DRAFT', visibility: 'INTERNAL', publicState: 'NOT_PUBLIC' });
    expect(await db.select().from(a.entityMedia).where(eq(a.entityMedia.entityId, ev.id))).toHaveLength(0);
    expect(await atlasMedia(two)).toBeUndefined();

    await expectError(setEntityMedia(admin.ctx, 'events', org.id, ev.id, { items: [{ mediaId: crypto.randomUUID(), caption: null }] }), 'VALIDATION_FAILED');
  });

  it('metadata edits, filters and viewer access', async () => {
    const { admin, org } = await setup();
    const img = await uploadImage(admin.ctx, org.id, 'anh.png');
    let m = await getMedia(admin.ctx, org.id, img);
    m = await updateMedia(admin.ctx, org.id, img, { version: m.version, title: 'Đồng phục năm đầu', tags: ['đồng phục'], occurredDate: { date: '2016-07-04', precision: 'YEAR' } });
    expect(m.occurredDate).toEqual({ date: '2016-01-01', precision: 'YEAR' });
    expect((await listMedia(admin.ctx, org.id, { q: 'dong phuc' })).items.map((i) => i.id)).toEqual([img]);
    expect((await listMedia(admin.ctx, org.id, { kind: 'DOCUMENT' })).total).toBe(0);
    await expectError(updateMedia(admin.ctx, org.id, img, { version: m.version - 1, title: 'Cũ' }), 'VERSION_CONFLICT');
  });
});
