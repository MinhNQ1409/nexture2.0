// Shared machinery for the four content kinds (Story, Event, Person, Product/Project):
// load with role filter, DTO, create/patch/delete wrappers, list, related items.
// Each kind file (stories.ts, events.ts, people.ts, products.ts) supplies a KindDef with its own columns.
import { and, count, eq, inArray, isNull, ne, or, sql, type AnyColumn, type SQL } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import type { Tx } from '@nexture/db';
import { coreTables as t } from '@nexture/db';
import type { OrgRole } from '@nexture/contracts';
import { diff, logActivity } from '../activity';
import { canOrg, entityPermissions } from '../authz';
import { requireMember, type Ctx, type DbOrTx } from '../context';
import { fail } from '../errors';
import { yearConds } from '../filters';
import { entitySources } from './source-list';
import { entityMediaList, mediaRefById } from '../media';
import { flushRevalidate } from '../public/flush';
import { publicState } from '../public/rules';
import { atlasPath, atlasTypeOf, emptySync, syncPublic, type PublicEntityType } from '../public/sync';

export type ContentType = PublicEntityType;
export type Fuzzy = { date: string; precision: 'YEAR' | 'MONTH' | 'DAY' };

/** All content tables share workflowColumns(); typed as the events table for the shared columns. */
export type ContentTable = typeof t.events;
type BaseRow = typeof t.events.$inferSelect;

export const TABLES: Record<ContentType, unknown> = {
  STORY: t.stories,
  EVENT: t.events,
  PERSON: t.people,
  PRODUCT_PROJECT: t.productsProjects,
};
export const tableOf = (type: ContentType) => TABLES[type] as ContentTable;

export type ListItem = { subtitle: string | null; summary: string | null; date: Fuzzy | null; endDate: Fuzzy | null };

export interface KindDef<R extends { id: string } = any, F extends Record<string, unknown> = Record<string, unknown>> {
  type: ContentType;
  collection: 'stories' | 'events' | 'people' | 'products';
  table: unknown;
  title(r: R): string;
  /** 04-trang-thai §4: extra fields required to submit/approve. */
  required(r: R): string[];
  coverId(r: R): string | null;
  fields(r: R, role: OrgRole): F;
  listItem(r: R): ListItem;
  /** Columns searched by `q`. */
  searchText(tbl: any): SQL;
  sorts(tbl: any): Record<string, SQL[]>;
  defaultSort: string;
  /** Main date column, used by the year filter. */
  dateCol(tbl: any): SQL | AnyColumn;
  filters?(tbl: any, query: Record<string, string | undefined>): (SQL | undefined)[];
}

export const fuzzy = (date: string | null, precision: string | null): Fuzzy | null => (date && precision ? { date, precision: precision as Fuzzy['precision'] } : null);

/** Viewer filter, 03-phan-quyen §3. */
export const visibleIn = (tbl: ContentTable, role: OrgRole): SQL | undefined =>
  role === 'VIEWER' ? and(eq(tbl.status, 'VERIFIED'), ne(tbl.visibility, 'PRIVATE')) : undefined;

type OrgPublic = { atlasEnabled: boolean; atlasHiddenAt: Date | null; slug: string };
async function orgPublic(db: DbOrTx, orgId: string): Promise<OrgPublic> {
  const [o] = await db
    .select({ atlasEnabled: t.organizations.atlasEnabled, atlasHiddenAt: t.organizations.atlasHiddenAt, slug: t.organizations.slug })
    .from(t.organizations)
    .where(eq(t.organizations.id, orgId));
  return o!;
}

async function userNames(db: DbOrTx, ids: (string | null)[]) {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!unique.length) return new Map<string, string>();
  const rows = await db.select({ id: t.user.id, name: t.user.name }).from(t.user).where(inArray(t.user.id, unique));
  return new Map(rows.map((r) => [r.id, r.name]));
}
const ref = (names: Map<string, string>, id: string | null) => (id ? { id, name: names.get(id) ?? 'Người dùng đã rời' } : null);

export type RelatedItem = { id: string; type: ContentType | 'CULTURE_VALUE'; title: string; status: string | null };
export type Related = { stories: RelatedItem[]; events: RelatedItem[]; people: RelatedItem[]; products: RelatedItem[]; values: RelatedItem[] };

const RELATED_KEY: Record<ContentType | 'CULTURE_VALUE', keyof Related> = {
  STORY: 'stories',
  EVENT: 'events',
  PERSON: 'people',
  PRODUCT_PROJECT: 'products',
  CULTURE_VALUE: 'values',
};

/** Items linked to one entity through core.relationships, filtered by what the caller may see. */
export async function relatedOf(db: DbOrTx, role: OrgRole, orgId: string, type: ContentType, id: string): Promise<Related> {
  const out: Related = { stories: [], events: [], people: [], products: [], values: [] };
  const rels = await db
    .select({ st: t.relationships.sourceType, s: t.relationships.sourceId, tt: t.relationships.targetType, tg: t.relationships.targetId })
    .from(t.relationships)
    .where(
      and(
        eq(t.relationships.organizationId, orgId),
        or(and(eq(t.relationships.sourceType, type), eq(t.relationships.sourceId, id)), and(eq(t.relationships.targetType, type), eq(t.relationships.targetId, id))),
      ),
    );
  const byType = new Map<string, string[]>();
  for (const r of rels) {
    const [ot, oid] = r.st === type && r.s === id ? [r.tt, r.tg] : [r.st, r.s];
    byType.set(ot, [...(byType.get(ot) ?? []), oid]);
  }
  for (const [ot, ids] of byType) {
    if (ot === 'CULTURE_VALUE') {
      const rows = await db
        .select({ id: t.cultureValues.id, title: t.cultureValues.nameVi, visibility: t.cultureValues.visibility })
        .from(t.cultureValues)
        .where(and(inArray(t.cultureValues.id, ids), isNull(t.cultureValues.deletedAt)))
        .orderBy(t.cultureValues.sortOrder);
      out.values = rows.filter((v) => role !== 'VIEWER' || v.visibility !== 'PRIVATE').map((v) => ({ id: v.id, type: 'CULTURE_VALUE', title: v.title, status: null }));
      continue;
    }
    const ct = ot as ContentType;
    const tbl = tableOf(ct);
    const titleCol = ct === 'PERSON' ? t.people.fullName : tbl.titleVi;
    const rows = await db
      .select({ id: tbl.id, title: titleCol, status: tbl.status })
      .from(tbl)
      .where(and(inArray(tbl.id, ids), isNull(tbl.deletedAt), visibleIn(tbl, role)));
    out[RELATED_KEY[ct]] = rows.map((r) => ({ id: r.id, type: ct, title: r.title, status: r.status })).sort((a, b) => a.title.localeCompare(b.title, 'vi'));
  }
  return out;
}

export async function contentDto<R extends BaseRow, F extends Record<string, unknown>>(ctx: Ctx, def: KindDef<any, F>, e: R, role: OrgRole, org?: OrgPublic) {
  const o = org ?? (await orgPublic(ctx.db, e.organizationId));
  const names = await userNames(ctx.db, [e.createdBy, e.updatedBy, e.verifiedBy, e.submittedBy]);
  const state = publicState(e, o);
  const atlasBase = ctx.atlas?.baseUrl ?? process.env.ATLAS_BASE_URL;
  return {
    type: def.type,
    id: e.id,
    organizationId: e.organizationId,
    ...def.fields(e, role),
    cover: await mediaRefById(ctx, e.organizationId, def.coverId(e)),
    internalNotes: role === 'VIEWER' ? null : e.internalNotes,
    status: e.status,
    visibility: e.visibility,
    publicState: state,
    publicUrl:
      state === 'LIVE' && e.publicSlug && atlasBase ? `${atlasBase.replace(/\/$/, '')}${atlasPath(atlasTypeOf(def.type, e as never), e.publicSlug)}` : null,
    returnNote: e.returnNote,
    atlasHiddenReason: e.atlasHiddenReason,
    version: e.version,
    createdBy: ref(names, e.createdBy)!,
    createdAt: e.createdAt,
    updatedBy: ref(names, e.updatedBy)!,
    updatedAt: e.updatedAt,
    verifiedBy: ref(names, e.verifiedBy),
    verifiedAt: e.verifiedAt,
    submittedBy: ref(names, e.submittedBy),
    submittedAt: e.submittedAt,
    permissions: entityPermissions(role, ctx.actor.userId, e),
    related: await relatedOf(ctx.db, role, e.organizationId, def.type, e.id),
    media: await entityMediaList(ctx, e.organizationId, def.type, e.id, role),
    sources: await entitySources(ctx, ctx.db, def.type, e.id, role),
  };
}
export type BaseContentDto = Awaited<ReturnType<typeof contentDto<BaseRow, Record<string, unknown>>>>;

/** Loads an item the caller may see; 404 otherwise. */
export async function loadContent<R = BaseRow>(db: DbOrTx, def: KindDef, role: OrgRole, orgId: string, id: string, forUpdate = false): Promise<R> {
  const tbl = def.table as ContentTable;
  const q = db
    .select()
    .from(tbl)
    .where(and(eq(tbl.id, id), eq(tbl.organizationId, orgId), isNull(tbl.deletedAt), visibleIn(tbl, role)));
  const [e] = forUpdate ? await q.for('update') : await q;
  if (!e) return fail('NOT_FOUND');
  return e as R;
}

export async function getContent<F extends Record<string, unknown>>(ctx: Ctx, def: KindDef<any, F>, orgId: string, id: string) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  return contentDto<BaseRow, F>(ctx, def, await loadContent(ctx.db, def, role, orgId, id), role);
}

export async function checkImage(db: DbOrTx, orgId: string, mediaId: string | null | undefined, field = 'coverMediaId') {
  if (!mediaId) return;
  const [m] = await db
    .select({ kind: t.mediaAssets.kind, status: t.mediaAssets.uploadStatus })
    .from(t.mediaAssets)
    .where(and(eq(t.mediaAssets.id, mediaId), eq(t.mediaAssets.organizationId, orgId), isNull(t.mediaAssets.deletedAt)));
  if (!m) fail('VALIDATION_FAILED', { fields: { [field]: 'Không tìm thấy ảnh' } });
  if (m!.status !== 'READY') fail('MEDIA_NOT_READY');
  if (m!.kind !== 'IMAGE') fail('MEDIA_KIND_INVALID');
}

/** Runs a content mutation, syncs Atlas in the same transaction, flushes after commit, returns the DTO. */
export async function afterContentChange<F extends Record<string, unknown>>(
  ctx: Ctx,
  orgId: string,
  def: KindDef<any, F>,
  id: string,
  fn: (tx: Tx) => Promise<{ row: BaseRow; role: OrgRole }>,
) {
  const sync = emptySync();
  const tbl = def.table as ContentTable;
  const { row, role } = await ctx.db.transaction(async (tx) => {
    const r = await fn(tx);
    await syncPublic(tx, ctx.storage, { kind: 'entity', type: def.type, id }, sync);
    const [fresh] = await tx.select().from(tbl).where(eq(tbl.id, id));
    return { row: (fresh as BaseRow | undefined) ?? r.row, role: r.role };
  });
  await flushRevalidate(ctx, sync);
  return contentDto<BaseRow, F>(ctx, def, row, role);
}

/** Insert with the workflow columns; `values` carries the kind's own columns. */
export async function insertContent<F extends Record<string, unknown>>(
  ctx: Ctx,
  def: KindDef<any, F>,
  orgId: string,
  input: { status: 'DRAFT' | 'VERIFIED'; visibility: 'PRIVATE' | 'INTERNAL'; internalNotes?: string | null },
  values: Record<string, unknown>,
) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'content.create')) fail('FORBIDDEN');
  if (input.status === 'VERIFIED' && role !== 'ADMIN') fail('FORBIDDEN');
  const { userId } = ctx.actor;
  const id = uuidv7();
  const now = new Date();
  const tbl = def.table as ContentTable;
  const row = await ctx.db.transaction(async (tx) => {
    const draft = {
      id,
      organizationId: orgId,
      ...values,
      internalNotes: input.internalNotes ?? null,
      status: input.status,
      visibility: input.visibility,
      ...(input.status === 'VERIFIED' ? { verifiedBy: userId, verifiedAt: now } : {}),
      createdBy: userId,
      updatedBy: userId,
    };
    if (input.status === 'VERIFIED') {
      const missing = def.required(draft as never);
      if (missing.length) fail('REQUIRED_FOR_REVIEW', { fields: missing });
    }
    const [e] = await tx.insert(tbl).values(draft as never).returning();
    const label = def.title(e as never);
    await logActivity(tx, { organizationId: orgId, actorId: userId, action: 'ENTITY_CREATED', targetType: def.type, targetId: id, targetLabel: label });
    if (input.status === 'VERIFIED') {
      await logActivity(tx, { organizationId: orgId, actorId: userId, action: 'ENTITY_APPROVED', targetType: def.type, targetId: id, targetLabel: label });
    }
    return e as BaseRow;
  });
  return contentDto<BaseRow, F>(ctx, def, row, role);
}

/** PATCH: version check, kind-specific `build(row)` returns the columns to set. */
export async function patchContent<R, F extends Record<string, unknown>>(
  ctx: Ctx,
  def: KindDef<any, F>,
  orgId: string,
  id: string,
  version: number,
  build: (row: R, tx: Tx) => Promise<Record<string, unknown>>,
) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const tbl = def.table as ContentTable;
  return afterContentChange(ctx, orgId, def, id, async (tx) => {
    const e = await loadContent<BaseRow>(tx, def, role, orgId, id, true);
    if (!entityPermissions(role, ctx.actor.userId, e).canEdit) fail('FORBIDDEN');
    if (e.version !== version) fail('VERSION_CONFLICT');
    const set = await build(e as R, tx);
    // A verified item stays verified when an admin edits it, so it must keep its required fields (04 §4).
    if (e.status !== 'DRAFT') {
      const missing = def.required({ ...e, ...set } as never);
      if (missing.length) fail('REQUIRED_FOR_REVIEW', { fields: missing });
    }
    const changes = diff(e as unknown as Record<string, unknown>, set);
    const [u] = await tx
      .update(tbl)
      .set({ ...set, version: sql`${tbl.version} + 1`, updatedBy: ctx.actor.userId, updatedAt: new Date() } as never)
      .where(eq(tbl.id, id))
      .returning();
    if (Object.keys(changes).length) {
      await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ENTITY_UPDATED', targetType: def.type, targetId: id, targetLabel: def.title(u as never), changes });
    }
    return { row: u as BaseRow, role };
  });
}

export async function deleteContent(ctx: Ctx, def: KindDef, orgId: string, id: string): Promise<void> {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const tbl = def.table as ContentTable;
  await afterContentChange(ctx, orgId, def, id, async (tx) => {
    const e = await loadContent<BaseRow>(tx, def, role, orgId, id, true);
    if (!entityPermissions(role, ctx.actor.userId, e).canDelete) fail('FORBIDDEN');
    const [u] = await tx.update(tbl).set({ deletedAt: new Date(), updatedBy: ctx.actor.userId, updatedAt: new Date() }).where(eq(tbl.id, id)).returning();
    // 02-database-ghi-chu §10: relations of a soft-deleted item are removed.
    await tx.execute(
      sql`DELETE FROM core.relationships WHERE (source_type = ${def.type} AND source_id = ${id}) OR (target_type = ${def.type} AND target_id = ${id})`,
    );
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ENTITY_DELETED', targetType: def.type, targetId: id, targetLabel: def.title(e as never) });
    return { row: u!, role };
  });
}

export type ContentListQuery = { page?: number | string; pageSize?: number | string; q?: string; status?: string; visibility?: string; sort?: string } & Record<
  string,
  string | number | undefined
>;

export async function listContent(ctx: Ctx, def: KindDef, orgId: string, query: ContentListQuery = {}) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const tbl = def.table as ContentTable;
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  const sorts = def.sorts(def.table);
  const sort = query.sort ?? def.defaultSort;
  if (!sorts[sort]) fail('VALIDATION_FAILED', { fields: { sort: 'Không hợp lệ' } });
  const conds: (SQL | undefined)[] = [eq(tbl.organizationId, orgId), isNull(tbl.deletedAt), visibleIn(tbl, role)];
  if (query.status) conds.push(eq(tbl.status, query.status as BaseRow['status']));
  if (query.visibility) conds.push(eq(tbl.visibility, query.visibility as BaseRow['visibility']));
  conds.push(...(def.filters?.(def.table, query as Record<string, string | undefined>) ?? []));
  const uuid = /^[0-9a-f-]{36}$/i;
  if (typeof query.valueId === 'string' && uuid.test(query.valueId)) {
    conds.push(sql`${tbl.id} IN (SELECT source_id FROM core.relationships WHERE target_type = 'CULTURE_VALUE' AND target_id = ${query.valueId})`);
  }
  if (typeof query.personId === 'string' && uuid.test(query.personId) && def.type !== 'PERSON') {
    conds.push(sql`${tbl.id} IN (SELECT target_id FROM core.relationships WHERE source_type = 'PERSON' AND source_id = ${query.personId})`);
  }
  conds.push(...yearConds(def.dateCol(def.table), query.yearFrom, query.yearTo));
  const q = query.q?.trim();
  if (q && q.length >= 2) {
    conds.push(sql`core.f_search_norm(${def.searchText(def.table)}) LIKE '%' || core.f_search_norm(${q}) || '%'`);
  } else if (q) {
    return { items: [], page, pageSize, total: 0 };
  }
  const where = and(...conds);
  const [{ total } = { total: 0 }] = await ctx.db.select({ total: count() }).from(tbl).where(where);
  const rows = (await ctx.db
    .select()
    .from(tbl)
    .where(where)
    .orderBy(...sorts[sort]!)
    .limit(pageSize)
    .offset((page - 1) * pageSize)) as BaseRow[];
  const org = await orgPublic(ctx.db, orgId);
  const thumbs = new Map<string, string>();
  for (const cid of new Set(rows.map((e) => def.coverId(e)).filter((x): x is string => Boolean(x)))) {
    const ref = await mediaRefById(ctx, orgId, cid);
    if (ref) thumbs.set(cid, ref.url);
  }
  return {
    page,
    pageSize,
    total,
    items: rows.map((e) => ({
      id: e.id,
      type: def.type,
      title: def.title(e),
      ...def.listItem(e),
      thumbnailUrl: thumbs.get(def.coverId(e) ?? '') ?? null,
      status: e.status,
      visibility: e.visibility,
      publicState: publicState(e, org),
      updatedAt: e.updatedAt,
    })),
  };
}
