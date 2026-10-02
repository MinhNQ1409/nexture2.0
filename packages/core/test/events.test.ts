import { describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { atlasTables as a, coreTables as t } from '@nexture/db';
import { setAtlasEnabled } from '../src/atlas';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from '../src/content/events';
import { setVisibility, transition } from '../src/content/workflow';
import { createInvite, acceptInvite } from '../src/invites';
import { createOrg, updateOrg } from '../src/orgs';
import { PUBLIC_ENTITY_COLUMNS } from '../src/public/fields';
import { db, expectError, makeUser } from './helpers';
import { tempStorage, uploadImage } from './helpers-storage';

const START = { date: '2015-03-01', precision: 'MONTH' as const };

async function publicOrg() {
  const admin = await makeUser('Admin');
  admin.ctx.storage = await tempStorage();
  const org = await createOrg(admin.ctx, {
    name: `Atlas Thử ${admin.id.slice(-6)}`,
    foundedYear: 2010,
    industryCode: 'FNB',
    provinceCode: 'ha-noi',
    shortDescVi: 'Doanh nghiệp thử nghiệm.',
    values: [{ nameVi: 'Tử tế' }],
  });
  const logo = await uploadImage(admin.ctx, org.id);
  const o2 = await updateOrg(admin.ctx, org.id, { version: org.version, logoMediaId: logo });
  return { admin, org: o2 };
}

describe('Atlas profile', () => {
  it('refuses to enable with missing fields, then enables, locks slug and projects the company', async () => {
    const admin = await makeUser();
    admin.ctx.storage = await tempStorage();
    const org = await createOrg(admin.ctx, { name: 'Thiếu Hồ Sơ' });
    await expectError(setAtlasEnabled(admin.ctx, org.id, { enabled: true }), 'ATLAS_PROFILE_INCOMPLETE');

    const { admin: ad2, org: full } = await publicOrg();
    const st = await setAtlasEnabled(ad2.ctx, full.id, { enabled: true });
    expect(st.enabled).toBe(true);
    const [row] = await db.select().from(t.organizations).where(eq(t.organizations.id, full.id));
    expect(row!.slugLocked).toBe(true);
    const [company] = await db.select().from(a.companies).where(eq(a.companies.orgId, full.id));
    expect(company?.logoUrl).toMatch(/^http:\/\/hub\.test\/api\/files\/public\/public\//);
    // Values are INTERNAL by default, so none are public yet.
    expect(company?.cultureValues).toEqual([]);
  });
});

describe('event workflow and publishing (04, 08)', () => {
  it('create -> approve -> PUBLIC -> LIVE; unverify drops to INTERNAL, removes it and writes a tombstone; republish keeps slug', async () => {
    const { admin, org } = await publicOrg();
    await setAtlasEnabled(admin.ctx, org.id, { enabled: true });
    let e = await createEvent(admin.ctx, org.id, { titleVi: 'Mở quán đầu tiên', startDate: START, internalNotes: 'SECRET-123', contentVi: '<p>Xin chào<script>alert(1)</script></p>' });
    expect(e.status).toBe('DRAFT');
    expect(e.contentVi).toBe('<p>Xin chào</p>');

    await expectError(setVisibility(admin.ctx, 'events', org.id, e.id, { version: e.version, visibility: 'PUBLIC' }), 'NOT_VERIFIED');
    e = await transition(admin.ctx, 'events', org.id, e.id, 'approve', { version: e.version });
    expect(e.status).toBe('VERIFIED');
    e = await setVisibility(admin.ctx, 'events', org.id, e.id, { version: e.version, visibility: 'PUBLIC' });
    expect(e.publicState).toBe('LIVE');

    const [pub] = await db.select().from(a.entities).where(eq(a.entities.id, e.id));
    expect(Object.keys(pub!).sort()).toEqual([...PUBLIC_ENTITY_COLUMNS].sort());
    expect(pub).toMatchObject({ entityType: 'EVENT', slug: 'mo-quan-dau-tien', title: 'Mở quán đầu tiên', subtitle: 'Cột mốc', sortDate: '2015-03-01', datePrecision: 'MONTH' });
    // Internal notes never reach schema atlas.
    const dump = await db.execute(
      sql`SELECT (SELECT coalesce(json_agg(e), '[]') FROM atlas.entities e)::text || (SELECT coalesce(json_agg(c), '[]') FROM atlas.companies c)::text AS j`,
    );
    expect(JSON.stringify(dump.rows)).not.toContain('SECRET-123');
    const [company] = await db.select().from(a.companies).where(eq(a.companies.orgId, org.id));
    expect(company!.publicEntityCount).toBe(1);

    // Edits to LIVE content show on Atlas right away.
    e = await updateEvent(admin.ctx, org.id, e.id, { version: e.version, titleVi: 'Mở quán đầu tiên ở Hà Nội' });
    const [pub2] = await db.select().from(a.entities).where(eq(a.entities.id, e.id));
    expect(pub2!.title).toBe('Mở quán đầu tiên ở Hà Nội');
    expect(pub2!.slug).toBe('mo-quan-dau-tien');

    e = await transition(admin.ctx, 'events', org.id, e.id, 'unverify', { version: e.version });
    expect([e.status, e.visibility, e.publicState]).toEqual(['DRAFT', 'INTERNAL', 'NOT_PUBLIC']);
    expect(await db.select().from(a.entities).where(eq(a.entities.id, e.id))).toHaveLength(0);
    expect(await db.select().from(a.tombstones).where(eq(a.tombstones.path, '/events/mo-quan-dau-tien'))).toHaveLength(1);

    e = await transition(admin.ctx, 'events', org.id, e.id, 'approve', { version: e.version });
    e = await setVisibility(admin.ctx, 'events', org.id, e.id, { version: e.version, visibility: 'PUBLIC' });
    const [again] = await db.select().from(a.entities).where(eq(a.entities.id, e.id));
    expect(again!.slug).toBe('mo-quan-dau-tien');
    expect(await db.select().from(a.tombstones).where(eq(a.tombstones.path, '/events/mo-quan-dau-tien'))).toHaveLength(0);

    // Turning the Atlas profile off removes everything and tombstones every path.
    await setAtlasEnabled(admin.ctx, org.id, { enabled: false });
    expect(await db.select().from(a.companies).where(eq(a.companies.orgId, org.id))).toHaveLength(0);
    expect(await db.select().from(a.tombstones).where(eq(a.tombstones.path, '/events/mo-quan-dau-tien'))).toHaveLength(1);
    expect((await getEvent(admin.ctx, org.id, e.id)).publicState).toBe('WAITING_ORG');

    // Deleting removes it for good.
    await setAtlasEnabled(admin.ctx, org.id, { enabled: true });
    expect(await db.select().from(a.entities).where(eq(a.entities.id, e.id))).toHaveLength(1);
    await deleteEvent(admin.ctx, org.id, e.id);
    expect(await db.select().from(a.entities).where(eq(a.entities.id, e.id))).toHaveLength(0);
    await expectError(getEvent(admin.ctx, org.id, e.id), 'NOT_FOUND');
  });

  it('enforces the transition table, roles and version', async () => {
    const { admin, org } = await publicOrg();
    const editor = await makeUser('Biên tập');
    const viewer = await makeUser('Xem');
    for (const [u, role] of [[editor, 'EDITOR'], [viewer, 'VIEWER']] as const) {
      const inv = await createInvite(admin.ctx, org.id, { role }, 'http://hub.test');
      await acceptInvite(u.ctx, inv.url.split('/invite/')[1]!, u.email);
    }
    await expectError(createEvent(editor.ctx, org.id, { titleVi: 'X', startDate: START, status: 'VERIFIED' }), 'FORBIDDEN');
    await expectError(createEvent(viewer.ctx, org.id, { titleVi: 'X', startDate: START }), 'FORBIDDEN');
    let e = await createEvent(editor.ctx, org.id, { titleVi: 'Sự kiện biên tập', startDate: START });

    // Viewer cannot see drafts.
    await expectError(getEvent(viewer.ctx, org.id, e.id), 'NOT_FOUND');
    expect((await listEvents(viewer.ctx, org.id)).total).toBe(0);

    await expectError(transition(editor.ctx, 'events', org.id, e.id, 'approve', { version: e.version }), 'FORBIDDEN');
    await expectError(transition(editor.ctx, 'events', org.id, e.id, 'withdraw', { version: e.version }), 'INVALID_TRANSITION');
    e = await transition(editor.ctx, 'events', org.id, e.id, 'submit', { version: e.version });
    expect(e.status).toBe('PENDING_REVIEW');
    await expectError(updateEvent(editor.ctx, org.id, e.id, { version: e.version, titleVi: 'Sửa' }), 'FORBIDDEN');
    await expectError(transition(admin.ctx, 'events', org.id, e.id, 'return', { version: e.version, note: '' }), 'VALIDATION_FAILED');
    e = await transition(admin.ctx, 'events', org.id, e.id, 'return', { version: e.version, note: 'Thiếu nguồn' });
    expect([e.status, e.returnNote]).toEqual(['DRAFT', 'Thiếu nguồn']);
    await expectError(transition(admin.ctx, 'events', org.id, e.id, 'approve', { version: e.version - 1 }), 'VERSION_CONFLICT');
    e = await transition(admin.ctx, 'events', org.id, e.id, 'approve', { version: e.version });
    expect([e.status, e.returnNote]).toEqual(['VERIFIED', null]);
    expect((await getEvent(viewer.ctx, org.id, e.id)).internalNotes).toBeNull();
    await expectError(setVisibility(editor.ctx, 'events', org.id, e.id, { version: e.version, visibility: 'PUBLIC' }), 'FORBIDDEN');
    await expectError(transition(admin.ctx, 'events', org.id, e.id, 'submit', { version: e.version }), 'INVALID_TRANSITION');
    await expectError(updateEvent(admin.ctx, org.id, e.id, { version: e.version, endDate: { date: '2000-01-01', precision: 'YEAR' } }), 'VALIDATION_FAILED');
  });
});
