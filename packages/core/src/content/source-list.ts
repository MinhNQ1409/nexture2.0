// Source list of one item, shared by the content DTO (kept free of engine imports to avoid a cycle).
import { and, asc, eq, isNull } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import type { OrgRole } from '@nexture/contracts';
import type { Ctx, DbOrTx } from '../context';
import { mediaRef } from '../media';
import type { PublicEntityType } from '../public/sync';

export type SourceDto = Awaited<ReturnType<typeof entitySources>>[number];

/** Sources of one item, in display order. Viewers see only the public ones. */
export async function entitySources(ctx: Ctx, db: DbOrTx, type: PublicEntityType, id: string, role: OrgRole) {
  const rows = await db
    .select({ s: t.entitySources, m: t.mediaAssets })
    .from(t.entitySources)
    .leftJoin(t.mediaAssets, and(eq(t.mediaAssets.id, t.entitySources.mediaId), isNull(t.mediaAssets.deletedAt)))
    .where(and(eq(t.entitySources.entityType, type), eq(t.entitySources.entityId, id), isNull(t.entitySources.deletedAt)))
    .orderBy(asc(t.entitySources.sortOrder), asc(t.entitySources.createdAt));
  return Promise.all(
    rows
      .filter((r) => role !== 'VIEWER' || r.s.isPublic)
      .map(async ({ s, m }) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        media: m && ctx.storage ? await mediaRef(ctx, m) : null,
        note: s.note,
        isPublic: s.isPublic,
        sortOrder: s.sortOrder,
      })),
  );
}
