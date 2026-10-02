import { describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import { createOrg, getOrg, slugAvailability, updateOrg } from '../src/orgs';
import { changeRole, listMembers, removeMember } from '../src/members';
import { acceptInvite, createInvite, listInvites, previewInvite, revokeInvite } from '../src/invites';
import { getMe } from '../src/me';
import { db, expectError, makeUser } from './helpers';

const HUB = 'http://hub.test';
const tokenOf = (url: string) => url.split('/invite/')[1]!;

describe('organizations', () => {
  it('creates org with Vietnamese slug, founder people and values; creator is ADMIN', async () => {
    const a = await makeUser('An');
    const org = await createOrg(a.ctx, { name: 'Gốm Đông Hà', founderNames: ['Nguyễn Văn A'], values: [{ nameVi: 'Tử tế' }, { nameVi: 'Bền bỉ' }] });
    expect(org.slug).toBe('gom-dong-ha');
    expect(org.myRole).toBe('ADMIN');
    expect(org.onboarding.hasFounder).toBe(true);
    const people = await db.select().from(t.people).where(eq(t.people.organizationId, org.id));
    expect(people).toMatchObject([{ fullName: 'Nguyễn Văn A', isFounder: true, status: 'VERIFIED', visibility: 'INTERNAL' }]);
    const values = await db.select().from(t.cultureValues).where(eq(t.cultureValues.organizationId, org.id));
    expect(values.map((v) => [v.nameVi, v.sortOrder])).toEqual([['Tử tế', 0], ['Bền bỉ', 1]]);

    const second = await createOrg(a.ctx, { name: 'Gốm Đông Hà' });
    expect(second.slug).toBe('gom-dong-ha-2');
    await expectError(createOrg(a.ctx, { name: 'Khác', slug: 'gom-dong-ha' }), 'SLUG_TAKEN');
    expect(await slugAvailability(db, 'gom-dong-ha')).toEqual({ available: false, suggestion: 'gom-dong-ha-3' });

    const me = await getMe(a.ctx);
    expect(me.organizations.map((o) => o.role)).toEqual(['ADMIN', 'ADMIN']);
  });

  it('rejects invalid input with VALIDATION_FAILED', async () => {
    const a = await makeUser();
    await expectError(createOrg(a.ctx, { name: 'x' }), 'VALIDATION_FAILED');
  });

  it('non-members get 404; only ADMIN edits; version and slug lock are enforced', async () => {
    const a = await makeUser();
    const stranger = await makeUser();
    const org = await createOrg(a.ctx, { name: 'Mây Ngàn Test' });
    await expectError(getOrg(stranger.ctx, org.id), 'NOT_FOUND');

    const updated = await updateOrg(a.ctx, org.id, { version: org.version, website: 'example.vn', provinceCode: 'ha-noi' });
    expect(updated.website).toBe('https://example.vn');
    expect(updated.version).toBe(org.version + 1);
    await expectError(updateOrg(a.ctx, org.id, { version: org.version, name: 'Cũ' }), 'VERSION_CONFLICT');

    await db.update(t.organizations).set({ slugLocked: true }).where(eq(t.organizations.id, org.id));
    await expectError(updateOrg(a.ctx, org.id, { version: updated.version, slug: 'moi-hoan-toan' }), 'SLUG_LOCKED');
  });

  it('cannot remove required Atlas fields while Atlas is on', async () => {
    const a = await makeUser();
    const org = await createOrg(a.ctx, { name: 'Bách Tâm Test', shortDescVi: 'Mô tả' });
    await db.update(t.organizations).set({ atlasEnabled: true }).where(eq(t.organizations.id, org.id));
    await expectError(updateOrg(a.ctx, org.id, { version: org.version, shortDescVi: '' }), 'ATLAS_PROFILE_INCOMPLETE');
  });
});

describe('members and invites', () => {
  it('UC-03: one-time invite link, role applied, link dies after use', async () => {
    const a = await makeUser('Admin');
    const b = await makeUser('Biên tập');
    const org = await createOrg(a.ctx, { name: 'Lời Mời Một' });
    const inv = await createInvite(a.ctx, org.id, { role: 'EDITOR' }, HUB);
    expect(inv.url.startsWith(`${HUB}/invite/`)).toBe(true);
    expect((await listInvites(a.ctx, org.id)).items).toHaveLength(1);
    expect(await previewInvite(db, tokenOf(inv.url))).toMatchObject({ organizationName: 'Lời Mời Một', role: 'EDITOR', emailRestricted: false });

    expect(await acceptInvite(b.ctx, tokenOf(inv.url), b.email)).toEqual({ orgId: org.id });
    expect((await getOrg(b.ctx, org.id)).myRole).toBe('EDITOR');
    await expectError(previewInvite(db, tokenOf(inv.url)), 'INVITE_INVALID');
    await expectError(acceptInvite((await makeUser()).ctx, tokenOf(inv.url), 'x@y.z'), 'INVITE_INVALID');
    expect((await listInvites(a.ctx, org.id)).items).toHaveLength(0);
    // Editors see members but cannot invite.
    expect((await listMembers(b.ctx, org.id)).items).toHaveLength(2);
    await expectError(createInvite(b.ctx, org.id, { role: 'VIEWER' }, HUB), 'FORBIDDEN');
  });

  it('UC-04: email-locked invite, already-member, revoke', async () => {
    const a = await makeUser();
    const c = await makeUser();
    const org = await createOrg(a.ctx, { name: 'Lời Mời Hai' });
    const locked = await createInvite(a.ctx, org.id, { role: 'VIEWER', email: 'X@A.test' }, HUB);
    await expectError(acceptInvite(c.ctx, tokenOf(locked.url), c.email), 'INVITE_EMAIL_MISMATCH');
    const rows = await db.select().from(t.organizationMembers).where(and(eq(t.organizationMembers.organizationId, org.id), eq(t.organizationMembers.userId, c.id)));
    expect(rows).toHaveLength(0);
    expect(await acceptInvite(c.ctx, tokenOf(locked.url), 'x@a.test')).toEqual({ orgId: org.id });

    const again = await createInvite(a.ctx, org.id, { role: 'EDITOR' }, HUB);
    await expectError(acceptInvite(c.ctx, tokenOf(again.url), c.email), 'ALREADY_MEMBER');
    await revokeInvite(a.ctx, org.id, again.id);
    await expectError(previewInvite(db, tokenOf(again.url)), 'INVITE_INVALID');
    // Viewer cannot list members.
    await expectError(listMembers(c.ctx, org.id), 'FORBIDDEN');
  });

  it('LAST_ADMIN protects demote, remove and leave', async () => {
    const a = await makeUser();
    const b = await makeUser();
    const org = await createOrg(a.ctx, { name: 'Admin Cuối' });
    await expectError(changeRole(a.ctx, org.id, a.id, { role: 'EDITOR' }), 'LAST_ADMIN');
    await expectError(removeMember(a.ctx, org.id, a.id), 'LAST_ADMIN');

    const inv = await createInvite(a.ctx, org.id, { role: 'VIEWER' }, HUB);
    await acceptInvite(b.ctx, tokenOf(inv.url), b.email);
    await expectError(changeRole(b.ctx, org.id, a.id, { role: 'VIEWER' }), 'FORBIDDEN');
    expect((await changeRole(a.ctx, org.id, b.id, { role: 'ADMIN' })).role).toBe('ADMIN');
    await changeRole(b.ctx, org.id, a.id, { role: 'EDITOR' });
    await removeMember(a.ctx, org.id, a.id); // Editor leaves
    await expectError(getOrg(a.ctx, org.id), 'NOT_FOUND');
    const log = await db.select({ action: t.activityLogs.action }).from(t.activityLogs).where(eq(t.activityLogs.organizationId, org.id));
    expect(log.map((l) => l.action)).toEqual(expect.arrayContaining(['ORG_CREATED', 'INVITE_CREATED', 'MEMBER_JOINED', 'MEMBER_ROLE_CHANGED', 'MEMBER_REMOVED']));
  });
});
