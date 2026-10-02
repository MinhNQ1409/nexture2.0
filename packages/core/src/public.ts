// The single source of the "shown on Atlas" rule: docs/spec/04-trang-thai.md §3.
import type { ContentStatus, Visibility } from './authz';

export type PublicEntityState = { deletedAt: Date | null; status: ContentStatus; visibility: Visibility; atlasHiddenAt: Date | null };
export type PublicOrgState = { atlasEnabled: boolean; atlasHiddenAt: Date | null };
export type PublicState = 'NOT_PUBLIC' | 'LIVE' | 'WAITING_ORG' | 'HIDDEN_BY_NEXTURE';

export const isOrgPublic = (org: PublicOrgState): boolean => org.atlasEnabled && org.atlasHiddenAt === null;

export const isPublic = (e: PublicEntityState, org: PublicOrgState): boolean =>
  e.deletedAt === null && e.status === 'VERIFIED' && e.visibility === 'PUBLIC' && e.atlasHiddenAt === null && isOrgPublic(org);

export function publicState(e: PublicEntityState, org: PublicOrgState): PublicState {
  if (e.deletedAt !== null || e.visibility !== 'PUBLIC' || e.status !== 'VERIFIED') return 'NOT_PUBLIC';
  if (e.atlasHiddenAt !== null || org.atlasHiddenAt !== null) return 'HIDDEN_BY_NEXTURE';
  if (!org.atlasEnabled) return 'WAITING_ORG';
  return 'LIVE';
}
