// PUT .../relations: replace one kind of link from the point of view of the item being edited (02-database-ghi-chu §6).
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { coreTables as t } from '@nexture/db';
import { relationsInput, type RelationTarget } from '@nexture/contracts';
import { logActivity } from '../activity';
import { entityPermissions } from '../authz';
import { requireMember, type Ctx } from '../context';
import { fail } from '../errors';
import { parse } from '../validate';
import { afterContentChange, loadContent, tableOf, type ContentType } from './engine';
import { KINDS } from './registry';

type RelType = typeof t.relationships.$inferInsert.relationshipType;
const PAIRS: [RelType, ContentType, RelationTarget][] = [
  ['PERSON_EVENT', 'PERSON', 'EVENT'],
  ['PERSON_PRODUCT_PROJECT', 'PERSON', 'PRODUCT_PROJECT'],
  ['PERSON_STORY', 'PERSON', 'STORY'],
  ['EVENT_PRODUCT_PROJECT', 'EVENT', 'PRODUCT_PROJECT'],
  ['STORY_EVENT', 'STORY', 'EVENT'],
  ['STORY_PRODUCT_PROJECT', 'STORY', 'PRODUCT_PROJECT'],
  ['STORY_CULTURE_VALUE', 'STORY', 'CULTURE_VALUE'],
  ['EVENT_CULTURE_VALUE', 'EVENT', 'CULTURE_VALUE'],
];

/** relationship_type and whether `self` is the source, or null when the pair is not allowed. */
export function relationFor(self: ContentType, other: RelationTarget): { type: RelType; selfIsSource: boolean } | null {
  for (const [type, s, tg] of PAIRS) {
    if (s === self && tg === other) return { type, selfIsSource: true };
    if (tg === self && s === other) return { type, selfIsSource: false };
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function setRelations(ctx: Ctx, collection: string, orgId: string, id: string, raw: unknown): Promise<any> {
  const kind = KINDS[collection];
  if (!kind) return fail('NOT_FOUND');
  const { targetType, ids } = parse(relationsInput, raw);
  const rel = relationFor(kind.type, targetType);
  if (!rel) return fail('INVALID_RELATION');
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const wanted = [...new Set(ids)];

  return afterContentChange(ctx, orgId, kind, id, async (tx) => {
    const self = await loadContent<typeof t.events.$inferSelect>(tx, kind, role, orgId, id, true);
    if (!entityPermissions(role, ctx.actor.userId, self).canEdit) fail('FORBIDDEN');

    // Both ends in the same org and not deleted.
    if (wanted.length) {
      const tbl = targetType === 'CULTURE_VALUE' ? t.cultureValues : tableOf(targetType);
      const found = await tx
        .select({ id: tbl.id })
        .from(tbl)
        .where(and(inArray(tbl.id, wanted), eq(tbl.organizationId, orgId), isNull(tbl.deletedAt)));
      if (found.length !== wanted.length) fail('INVALID_RELATION');
    }

    const selfCol = rel.selfIsSource ? t.relationships.sourceId : t.relationships.targetId;
    const otherCol = rel.selfIsSource ? t.relationships.targetId : t.relationships.sourceId;
    const existing = await tx
      .select({ rid: t.relationships.id, other: otherCol })
      .from(t.relationships)
      .where(and(eq(t.relationships.relationshipType, rel.type), eq(selfCol, id)));
    const have = new Set(existing.map((r) => r.other));
    const remove = existing.filter((r) => !wanted.includes(r.other)).map((r) => r.rid);
    const add = wanted.filter((x) => !have.has(x));
    if (remove.length) await tx.delete(t.relationships).where(inArray(t.relationships.id, remove));
    for (const other of add) {
      await tx.insert(t.relationships).values({
        id: uuidv7(),
        organizationId: orgId,
        relationshipType: rel.type,
        sourceType: rel.selfIsSource ? kind.type : targetType,
        sourceId: rel.selfIsSource ? id : other,
        targetType: rel.selfIsSource ? targetType : kind.type,
        targetId: rel.selfIsSource ? other : id,
        createdBy: ctx.actor.userId,
      });
    }
    if (add.length || remove.length) {
      await logActivity(tx, {
        organizationId: orgId,
        actorId: ctx.actor.userId,
        action: 'RELATIONS_UPDATED',
        targetType: kind.type,
        targetId: id,
        targetLabel: kind.title(self),
        changes: { [targetType]: [existing.length, wanted.length] },
      });
    }
    return { row: self, role };
  });
}
