import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { atlasTables as a, coreTables as t } from '@nexture/db';
import { setAtlasEnabled } from '../src/atlas';
import { createEvent, getEvent, listEvents } from '../src/content/events';
import { createPerson } from '../src/content/people';
import { setRelations } from '../src/content/relations';
import { createStory } from '../src/content/stories';
import { setVisibility } from '../src/content/workflow';
import { createOrg, updateOrg } from '../src/orgs';
import { createValue, deleteValue, listValues, reorderValues, updateValue } from '../src/values';
import { db, expectError, makeUser } from './helpers';
import { tempStorage, uploadImage } from './helpers-storage';

const START = { date: '2016-05-01', precision: 'MONTH' as const };

async function liveOrg() {
  const admin = await makeUser('Admin');
  admin.ctx.storage = await tempStorage();
  const org = await createOrg(admin.ctx, { name: `Giá trị ${admin.id.slice(-6)}`, foundedYear: 2012, industryCode: 'FNB', provinceCode: 'ha-noi', shortDescVi: 'Thử.' });
  const logo = await uploadImage(admin.ctx, org.id);
  await updateOrg(admin.ctx, org.id, { version: org.version, logoMediaId: logo });
  await setAtlasEnabled(admin.ctx, org.id, { enabled: true });
  return { admin, org };
}

describe('culture values', () => {
  it('admin manages values; public ones reach the company; names are unique; editor cannot manage', async () => {
    const { admin, org } = await liveOrg();
    const a1 = await createValue(admin.ctx, org.id, { nameVi: 'Tử tế', visibility: 'PUBLIC' });
    const a2 = await createValue(admin.ctx, org.id, { nameVi: 'Học mỗi ngày' });
    await expectError(createValue(admin.ctx, org.id, { nameVi: 'tử tế' }), 'VALUE_NAME_TAKEN');
    const editor = await makeUser('Editor');
    await db.insert(t.organizationMembers).values({ organizationId: org.id, userId: editor.id, role: 'EDITOR' });
    await expectError(createValue(editor.ctx, org.id, { nameVi: 'X' }), 'FORBIDDEN');

    let [company] = await db.select().from(a.companies).where(eq(a.companies.orgId, org.id));
    expect(company?.cultureValues.map((v) => v.name)).toEqual(['Tử tế']);

    await updateValue(admin.ctx, org.id, a2.id, { version: a2.version, visibility: 'PUBLIC', descriptionVi: 'Hai giờ mỗi tuần.' });
    await reorderValues(admin.ctx, org.id, { ids: [a2.id, a1.id] });
    [company] = await db.select().from(a.companies).where(eq(a.companies.orgId, org.id));
    expect(company?.cultureValues).toEqual([
      { name: 'Học mỗi ngày', description: 'Hai giờ mỗi tuần.' },
      { name: 'Tử tế', description: null },
    ]);
    await expectError(reorderValues(admin.ctx, org.id, { ids: [a1.id] }), 'VALIDATION_FAILED');

    await deleteValue(admin.ctx, org.id, a1.id);
    expect((await listValues(admin.ctx, org.id)).items.map((v) => v.nameVi)).toEqual(['Học mỗi ngày']);
  });
});

describe('relations', () => {
  it('links from either side, rejects bad pairs and other orgs, feeds extra.values, Atlas relations and list filters', async () => {
    const { admin, org } = await liveOrg();
    const other = await liveOrg();
    const value = await createValue(admin.ctx, org.id, { nameVi: 'Tôn trọng người trồng', visibility: 'PUBLIC' });
    let ev = await createEvent(admin.ctx, org.id, { titleVi: 'Ký kết nông hộ', startDate: START, status: 'VERIFIED' });
    const person = await createPerson(admin.ctx, org.id, { fullName: 'Nguyễn An', roleTitleVi: 'Sáng lập', status: 'VERIFIED' });
    const story = await createStory(admin.ctx, org.id, { titleVi: 'Chuyến xe', summaryVi: 'S', contentVi: '<p>C</p>', status: 'VERIFIED' });
    const foreign = await createPerson(other.admin.ctx, other.org.id, { fullName: 'Người ngoài' });

    await expectError(setRelations(admin.ctx, 'people', org.id, person.id, { targetType: 'CULTURE_VALUE', ids: [value.id] }), 'INVALID_RELATION');
    await expectError(setRelations(admin.ctx, 'events', org.id, ev.id, { targetType: 'PERSON', ids: [foreign.id] }), 'INVALID_RELATION');

    ev = await setRelations(admin.ctx, 'events', org.id, ev.id, { targetType: 'CULTURE_VALUE', ids: [value.id] });
    ev = await setRelations(admin.ctx, 'events', org.id, ev.id, { targetType: 'PERSON', ids: [person.id] });
    // From the person's side, the event is already there; add the story.
    const p2 = await setRelations(admin.ctx, 'people', org.id, person.id, { targetType: 'STORY', ids: [story.id] });
    expect(p2.related.events.map((x: { id: string }) => x.id)).toEqual([ev.id]);
    expect(p2.related.stories.map((x: { id: string }) => x.id)).toEqual([story.id]);
    const rels = await db.select().from(t.relationships).where(eq(t.relationships.targetId, ev.id));
    expect(rels.map((r) => [r.relationshipType, r.sourceType])).toEqual([['PERSON_EVENT', 'PERSON']]);

    // Publish both ends: Atlas shows the link in both directions and the value on the event.
    ev = await setVisibility(admin.ctx, 'events', org.id, ev.id, { version: ev.version, visibility: 'PUBLIC' });
    const pFresh = (await db.select().from(t.people).where(eq(t.people.id, person.id)))[0]!;
    await setVisibility(admin.ctx, 'people', org.id, person.id, { version: pFresh.version, visibility: 'PUBLIC' });
    const [pubEv] = await db.select().from(a.entities).where(eq(a.entities.id, ev.id));
    expect(pubEv?.extra).toMatchObject({ values: ['Tôn trọng người trồng'] });
    const atlasRel = await db.select().from(a.relations).where(eq(a.relations.fromId, person.id));
    expect(atlasRel.map((r) => r.toId)).toEqual([ev.id]);

    expect((await listEvents(admin.ctx, org.id, { valueId: value.id })).items.map((i) => i.id)).toEqual([ev.id]);
    expect((await listEvents(admin.ctx, org.id, { personId: person.id })).total).toBe(1);
    expect((await listValues(admin.ctx, org.id)).items[0]).toMatchObject({ eventCount: 1, storyCount: 0 });

    // Clearing removes it.
    await setRelations(admin.ctx, 'events', org.id, ev.id, { targetType: 'PERSON', ids: [] });
    expect((await getEvent(admin.ctx, org.id, ev.id)).related.people).toEqual([]);
    expect(await db.select().from(a.relations).where(eq(a.relations.fromId, person.id))).toEqual([]);
  });
});
