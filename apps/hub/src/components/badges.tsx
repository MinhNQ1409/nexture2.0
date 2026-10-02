// Status badges: docs/spec/09-giao-dien.md §3.
import { Globe, Lock } from 'lucide-react';
import { PUBLIC_STATE_LABELS, STATUS_LABELS, VISIBILITY_LABELS, type ContentStatus, type Visibility } from '@nexture/contracts';
import { Badge } from './ui';

export function StatusBadge({ status }: { status: ContentStatus }) {
  const tone = status === 'VERIFIED' ? 'success' : status === 'PENDING_REVIEW' ? 'warning' : 'neutral';
  return <Badge tone={tone}>{STATUS_LABELS[status]}</Badge>;
}

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  return (
    <Badge tone={visibility === 'PUBLIC' ? 'info' : 'neutral'}>
      {visibility === 'PRIVATE' && <Lock size={12} strokeWidth={1.5} aria-hidden />}
      {visibility === 'PUBLIC' && <Globe size={12} strokeWidth={1.5} aria-hidden />}
      {VISIBILITY_LABELS[visibility]}
    </Badge>
  );
}

export type PublicStateValue = keyof typeof PUBLIC_STATE_LABELS;
export function PublicStateBadge({ state }: { state: PublicStateValue }) {
  if (state === 'NOT_PUBLIC') return null;
  const tone = state === 'LIVE' ? 'success' : state === 'WAITING_ORG' ? 'warning' : state === 'HIDDEN_BY_NEXTURE' ? 'error' : 'neutral';
  return <Badge tone={tone}>{PUBLIC_STATE_LABELS[state]}</Badge>;
}
