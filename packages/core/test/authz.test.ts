import { describe, expect, it } from 'vitest';
import { canOrg, entityPermissions, type ContentStatus, type Visibility } from '../src/authz';

const me = 'u1';
const other = 'u2';
const e = (status: ContentStatus, visibility: Visibility = 'INTERNAL', createdBy = me, submittedBy: string | null = null) => ({ status, visibility, createdBy, submittedBy });

describe('org matrix (03 §2)', () => {
  it('only ADMIN manages profile, members, invites, atlas, activity', () => {
    for (const a of ['org.edit', 'org.toggleAtlas', 'members.manage', 'invites.manage', 'activity.view', 'values.manage'] as const) {
      expect([canOrg('ADMIN', a), canOrg('EDITOR', a), canOrg('VIEWER', a)]).toEqual([true, false, false]);
    }
  });
  it('VIEWER cannot see members, review queue or atlas page', () => {
    for (const a of ['members.view', 'review.view', 'atlas.view', 'content.create', 'media.upload'] as const) {
      expect([canOrg('ADMIN', a), canOrg('EDITOR', a), canOrg('VIEWER', a)]).toEqual([true, true, false]);
    }
  });
});

describe('entity matrix (03 §2)', () => {
  it('VIEWER sees only VERIFIED non-PRIVATE and does nothing else', () => {
    expect(entityPermissions('VIEWER', me, e('VERIFIED', 'INTERNAL')).canView).toBe(true);
    expect(entityPermissions('VIEWER', me, e('VERIFIED', 'PUBLIC')).canView).toBe(true);
    expect(entityPermissions('VIEWER', me, e('VERIFIED', 'PRIVATE')).canView).toBe(false);
    expect(entityPermissions('VIEWER', me, e('DRAFT')).canView).toBe(false);
    expect(entityPermissions('VIEWER', me, e('PENDING_REVIEW')).canView).toBe(false);
    expect(entityPermissions('VIEWER', me, e('VERIFIED')).canEdit).toBe(false);
  });

  it('EDITOR edits only drafts, deletes own drafts, withdraws own submissions', () => {
    expect(entityPermissions('EDITOR', me, e('DRAFT')).canEdit).toBe(true);
    expect(entityPermissions('EDITOR', me, e('PENDING_REVIEW')).canEdit).toBe(false);
    expect(entityPermissions('EDITOR', me, e('VERIFIED')).canEdit).toBe(false);
    expect(entityPermissions('EDITOR', me, e('DRAFT', 'INTERNAL', me)).canDelete).toBe(true);
    expect(entityPermissions('EDITOR', me, e('DRAFT', 'INTERNAL', other)).canDelete).toBe(false);
    expect(entityPermissions('EDITOR', me, e('PENDING_REVIEW', 'INTERNAL', me, me)).canWithdraw).toBe(true);
    expect(entityPermissions('EDITOR', me, e('PENDING_REVIEW', 'INTERNAL', me, other)).canWithdraw).toBe(false);
    for (const s of ['DRAFT', 'PENDING_REVIEW', 'VERIFIED'] as const) {
      const p = entityPermissions('EDITOR', me, e(s));
      expect([p.canApprove, p.canReturn, p.canUnverify]).toEqual([false, false, false]);
    }
  });

  it('EDITOR visibility: PRIVATE/INTERNAL on non-PUBLIC drafts only, never PUBLIC', () => {
    expect(entityPermissions('EDITOR', me, e('DRAFT', 'INTERNAL')).allowedVisibilities).toEqual(['PRIVATE', 'INTERNAL']);
    expect(entityPermissions('EDITOR', me, e('VERIFIED', 'INTERNAL')).allowedVisibilities).toEqual([]);
  });

  it('ADMIN may set PUBLIC only when VERIFIED', () => {
    expect(entityPermissions('ADMIN', me, e('VERIFIED')).allowedVisibilities).toContain('PUBLIC');
    expect(entityPermissions('ADMIN', me, e('DRAFT')).allowedVisibilities).not.toContain('PUBLIC');
    expect(entityPermissions('ADMIN', me, e('PENDING_REVIEW')).allowedVisibilities).not.toContain('PUBLIC');
  });

  it('ADMIN transitions follow 04 §1', () => {
    const p = (s: ContentStatus) => entityPermissions('ADMIN', me, e(s));
    expect([p('DRAFT').canSubmit, p('DRAFT').canApprove, p('DRAFT').canReturn]).toEqual([true, true, false]);
    expect([p('PENDING_REVIEW').canWithdraw, p('PENDING_REVIEW').canApprove, p('PENDING_REVIEW').canReturn]).toEqual([true, true, true]);
    expect([p('VERIFIED').canUnverify, p('VERIFIED').canApprove]).toEqual([true, false]);
  });
});
