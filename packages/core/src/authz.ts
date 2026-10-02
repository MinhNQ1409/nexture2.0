// Permission rules: docs/spec/03-phan-quyen.md. Pure functions, no I/O.
import type { OrgRole } from '@nexture/contracts';

export type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'VERIFIED';
export type Visibility = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';

export type OrgPermissions = {
  canEditProfile: boolean;
  canManageMembers: boolean;
  canToggleAtlas: boolean;
  canViewActivity: boolean;
};

export function orgPermissions(role: OrgRole): OrgPermissions {
  const admin = role === 'ADMIN';
  return { canEditProfile: admin, canManageMembers: admin, canToggleAtlas: admin, canViewActivity: admin };
}

export type OrgAction =
  | 'org.view'
  | 'org.edit'
  | 'org.toggleAtlas'
  | 'members.view'
  | 'members.manage'
  | 'invites.manage'
  | 'activity.view'
  | 'review.view'
  | 'atlas.view'
  | 'content.create'
  | 'media.upload'
  | 'values.manage';

const ORG_ACTIONS: Record<OrgAction, readonly OrgRole[]> = {
  'org.view': ['ADMIN', 'EDITOR', 'VIEWER'],
  'org.edit': ['ADMIN'],
  'org.toggleAtlas': ['ADMIN'],
  'members.view': ['ADMIN', 'EDITOR'],
  'members.manage': ['ADMIN'],
  'invites.manage': ['ADMIN'],
  'activity.view': ['ADMIN'],
  'review.view': ['ADMIN', 'EDITOR'],
  'atlas.view': ['ADMIN', 'EDITOR'],
  'content.create': ['ADMIN', 'EDITOR'],
  'media.upload': ['ADMIN', 'EDITOR'],
  'values.manage': ['ADMIN'],
};

export const canOrg = (role: OrgRole, action: OrgAction): boolean => ORG_ACTIONS[action].includes(role);

/** Fields of a content entity or media asset relevant to permission checks. */
export type EntityAuthState = {
  status: ContentStatus;
  visibility: Visibility;
  createdBy: string;
  submittedBy: string | null;
};

export type EntityPermissions = {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canWithdraw: boolean;
  canApprove: boolean;
  canReturn: boolean;
  canUnverify: boolean;
  allowedVisibilities: Visibility[];
};

/** 03-phan-quyen.md §2–3 for content entities and media. */
export function entityPermissions(role: OrgRole, userId: string, e: EntityAuthState): EntityPermissions {
  const none: EntityPermissions = {
    canView: false,
    canEdit: false,
    canDelete: false,
    canSubmit: false,
    canWithdraw: false,
    canApprove: false,
    canReturn: false,
    canUnverify: false,
    allowedVisibilities: [],
  };
  if (role === 'VIEWER') {
    return { ...none, canView: e.status === 'VERIFIED' && e.visibility !== 'PRIVATE' };
  }
  if (role === 'ADMIN') {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canSubmit: e.status === 'DRAFT',
      canWithdraw: e.status === 'PENDING_REVIEW',
      canApprove: e.status === 'DRAFT' || e.status === 'PENDING_REVIEW',
      canReturn: e.status === 'PENDING_REVIEW',
      canUnverify: e.status === 'VERIFIED',
      allowedVisibilities: e.status === 'VERIFIED' ? ['PRIVATE', 'INTERNAL', 'PUBLIC'] : ['PRIVATE', 'INTERNAL'],
    };
  }
  // EDITOR
  const draft = e.status === 'DRAFT';
  return {
    ...none,
    canView: true,
    canEdit: draft,
    canDelete: draft && e.createdBy === userId,
    canSubmit: draft,
    canWithdraw: e.status === 'PENDING_REVIEW' && e.submittedBy === userId,
    // Editor switches only between PRIVATE and INTERNAL, only on drafts that are not PUBLIC (note 4).
    allowedVisibilities: draft && e.visibility !== 'PUBLIC' ? ['PRIVATE', 'INTERNAL'] : [],
  };
}
