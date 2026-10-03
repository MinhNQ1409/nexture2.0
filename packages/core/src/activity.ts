// docs/spec/02-database-ghi-chu.md §8
import { uuidv7 } from 'uuidv7';
import { coreTables as t } from '@nexture/db';
import type { DbOrTx } from './context';

export type ActivityAction =
  | 'ORG_CREATED'
  | 'ORG_UPDATED'
  | 'ATLAS_ENABLED'
  | 'ATLAS_DISABLED'
  | 'MEMBER_ROLE_CHANGED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_JOINED'
  | 'MEMBER_ADDED'
  | 'INVITE_CREATED'
  | 'INVITE_REVOKED'
  | 'MEDIA_UPLOADED'
  | 'MEDIA_UPDATED'
  | 'MEDIA_DELETED'
  | 'ENTITY_CREATED'
  | 'ENTITY_UPDATED'
  | 'ENTITY_DELETED'
  | 'ENTITY_SUBMITTED'
  | 'ENTITY_APPROVED'
  | 'ENTITY_RETURNED'
  | 'ENTITY_UNVERIFIED'
  | 'VISIBILITY_CHANGED'
  | 'RELATIONS_UPDATED'
  | 'ENTITY_MEDIA_UPDATED'
  | 'SOURCE_ADDED'
  | 'SOURCE_REMOVED'
  | 'ATLAS_HIDDEN_BY_NEXTURE'
  | 'ATLAS_UNHIDDEN_BY_NEXTURE'
  | 'SOURCE_UPDATED'
  | 'ORG_LOCKED'
  | 'ORG_UNLOCKED'
  | 'ORG_DELETED';

export async function logActivity(
  db: DbOrTx,
  entry: {
    organizationId: string | null;
    actorId: string | null;
    action: ActivityAction;
    targetType: string;
    targetId: string;
    targetLabel?: string | null;
    changes?: Record<string, [unknown, unknown]> | null;
  },
): Promise<void> {
  await db.insert(t.activityLogs).values({
    id: uuidv7(),
    organizationId: entry.organizationId,
    actorId: entry.actorId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    targetLabel: entry.targetLabel ?? null,
    changes: entry.changes ?? null,
  });
}

/** {field: [before, after]} for fields whose value changed. */
export function diff<T extends Record<string, unknown>>(before: T, after: Partial<T>): Record<string, [unknown, unknown]> {
  const out: Record<string, [unknown, unknown]> = {};
  for (const [k, v] of Object.entries(after)) {
    if (v !== undefined && JSON.stringify(before[k]) !== JSON.stringify(v)) out[k] = [before[k], v];
  }
  return out;
}
