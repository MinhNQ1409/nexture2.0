import { describe, expect, it } from 'vitest';
import { coreTables as t } from '@nexture/db';
import { createEvent } from '../src/content/events';
import { createPerson } from '../src/content/people';
import { setRelations } from '../src/content/relations';
import { createStory } from '../src/content/stories';
import { transition } from '../src/content/workflow';
import { mediaTransition, getMedia } from '../src/media';
import { createOrg } from '../src/orgs';
import { listActivity, reviewQueue, timeline } from '../src/views';
import { db, expectError, makeUser } from './helpers';
import { tempStorage, uploadImage } from './helpers-storage';

async function setup() {
  const admin = await makeUser('Quản trị');
  admin.ctx.storage = await tempStorage();
  const org = await createOrg(admin.ctx, { name: `Views ${admin.id.slice(-6)}`, foundedYear: 2012, industryCode: 'FNB', provinceCode: 'ha-noi', shortDescVi: 'Thử.' });
  const editor = await makeUser('Biên tập');
  editor.ctx.storage = admin.ctx.storage;
  const viewer = await makeUser('Xem');
  await db.insert(t.organizationMembers).values([
    { organizationId: org.id, userId: editor.id, role: 'EDITOR' },
    { organizationId: org.id, userId: viewer.id, role: 'VIEWER' },
  ]);
  return { admin, editor, viewer, org };
}

describe('timeline', () => {
  it('groups verified events by year with linked people; unverified only on request and never for viewers', async () => {
    const { admin, viewer, org } = await setup();
    const a = await createEvent(admin.ctx, org.id, { titleVi: 'Thành lập', eventType: 'FOUNDING', startDate: { date: '2012-05-01', precision: 'MONTH' }, status: 'VERIFIED' });
    await createEvent(admin.ctx, org.id, { titleVi: 'Mở chi nhánh', eventType: 'EXPANSION', startDate: { date: '2015-01-01', precision: 'YEAR' }, status: 'VERIFIED' });
    await createEvent(admin.ctx, org.id, { titleVi: 'Giải thưởng', eventType: 'ACHIEVEMENT', startDate: { date: '2012-01-01', precision: 'YEAR' }, status: 'VERIFIED' });
    await createEvent(admin.ctx, org.id, { titleVi: 'Nháp', startDate: { date: '2013-01-01', precision: 'YEAR' } });
    const p = await createPerson(admin.ctx, org.id, { fullName: 'Lê Minh', roleTitleVi: 'Sáng lập', status: 'VERIFIED' });
    await setRelations(admin.ctx, 'events', org.id, a.id, { targetType: 'PERSON', ids: [p.id] });

    const r = await timeline(admin.ctx, org.id);
    expect(r.years.map((y) => [y.year, y.items.map((i) => (i as { title: string }).title)])).toEqual([
      [2012, ['Giải thưởng', 'Thành lập']],
      [2015, ['Mở chi nhánh']],
    ]);
    expect((r.years[0]!.items[1] as { people: { name: string }[] }).people.map((x) => x.name)).toEqual(['Lê Minh']);

    expect((await timeline(admin.ctx, org.id, { includeUnverified: 'true' })).years.map((y) => y.year)).toEqual([2012, 2013, 2015]);
    expect((await timeline(viewer.ctx, org.id, { includeUnverified: 'true' })).years.map((y) => y.year)).toEqual([2012, 2015]);
    expect((await timeline(admin.ctx, org.id, { eventType: 'EXPANSION' })).years.map((y) => y.year)).toEqual([2015]);
    expect((await timeline(admin.ctx, org.id, { personId: p.id })).years.flatMap((y) => y.items).length).toBe(1);
  });
});

describe('review queue and activity', () => {
  it('lists pending content and media oldest first for admins and editors; viewers are refused', async () => {
    const { admin, editor, viewer, org } = await setup();
    const s = await createStory(editor.ctx, org.id, { titleVi: 'Câu chuyện chờ', summaryVi: 'Tóm', contentVi: '<p>Nội dung</p>' });
    await transition(editor.ctx, 'stories', org.id, s.id, 'submit', { version: s.version });
    const img = await uploadImage(editor.ctx, org.id, 'cho.png');
    const m = await getMedia(editor.ctx, org.id, img);
    await mediaTransition(editor.ctx, org.id, img, 'submit', { version: m.version });

    const q = await reviewQueue(admin.ctx, org.id);
    expect(q.items.map((i) => [i.type, i.title, i.submittedBy?.name])).toEqual([
      ['STORY', 'Câu chuyện chờ', 'Biên tập'],
      ['MEDIA', 'cho', 'Biên tập'],
    ]);
    expect((await reviewQueue(editor.ctx, org.id)).items).toHaveLength(2);
    await expectError(reviewQueue(viewer.ctx, org.id), 'FORBIDDEN');

    const first = q.items[0]!;
    await transition(admin.ctx, 'stories', org.id, first.id, 'approve', { version: first.version });
    expect((await reviewQueue(admin.ctx, org.id)).items.map((i) => i.type)).toEqual(['MEDIA']);

    const log = await listActivity(admin.ctx, org.id, { pageSize: 5 });
    expect(log.total).toBeGreaterThan(3);
    expect(log.items[0]).toMatchObject({ action: 'ENTITY_APPROVED', targetLabel: 'Câu chuyện chờ', actor: { name: 'Quản trị' } });
    await expectError(listActivity(editor.ctx, org.id), 'FORBIDDEN');
  });
});
