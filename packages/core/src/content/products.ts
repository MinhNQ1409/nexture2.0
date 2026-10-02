// Products & projects: docs/spec/05-api.yaml /orgs/{orgId}/products, 06-hub-man-hinh.md §6–7.
import { asc, desc, eq, sql } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import { PP_KIND_LABELS, PP_KINDS, productInput, productPatch, type ProductInput } from '@nexture/contracts';
import type { Ctx } from '../context';
import { parse } from '../validate';
import { checkImage, deleteContent, fuzzy, getContent, insertContent, listContent, patchContent, type ContentListQuery, type KindDef } from './engine';
import { cleanHtml } from './html';

export type ProductRow = typeof t.productsProjects.$inferSelect;
type Tbl = typeof t.productsProjects;

export const PRODUCT_KIND = {
  type: 'PRODUCT_PROJECT',
  collection: 'products',
  table: t.productsProjects,
  title: (p) => p.titleVi,
  required: (p) => (p.summaryVi ? [] : ['summaryVi']),
  coverId: (p) => p.coverMediaId,
  fields: (p) => ({
    kind: p.kind,
    titleVi: p.titleVi,
    titleEn: p.titleEn,
    summaryVi: p.summaryVi,
    summaryEn: p.summaryEn,
    descriptionVi: p.descriptionVi,
    descriptionEn: p.descriptionEn,
    launchDate: fuzzy(p.launchDate, p.launchDatePrecision),
    ppStatus: p.ppStatus,
    coverMediaId: p.coverMediaId,
  }),
  listItem: (p) => ({ subtitle: PP_KIND_LABELS[p.kind], summary: p.summaryVi, date: fuzzy(p.launchDate, p.launchDatePrecision), endDate: null }),
  searchText: (x: Tbl) => sql`${x.titleVi} || ' ' || coalesce(${x.summaryVi}, '')`,
  sorts: (x: Tbl) => ({
    date_desc: [sql`${x.launchDate} DESC NULLS LAST`, asc(x.titleVi)],
    date_asc: [sql`${x.launchDate} ASC NULLS LAST`, asc(x.titleVi)],
    updated_desc: [desc(x.updatedAt)],
    title_asc: [asc(x.titleVi)],
  }),
  defaultSort: 'date_desc',
  filters: (x: Tbl, q) => [q.kind && (PP_KINDS as readonly string[]).includes(q.kind) ? eq(x.kind, q.kind as ProductRow['kind']) : undefined],
} satisfies KindDef<ProductRow>;

export const getProduct = (ctx: Ctx, orgId: string, id: string) => getContent(ctx, PRODUCT_KIND, orgId, id);
export type ProductDto = Awaited<ReturnType<typeof getProduct>>;

export async function createProduct(ctx: Ctx, orgId: string, raw: ProductInput | unknown) {
  const input = parse(productInput, raw);
  await checkImage(ctx.db, orgId, input.coverMediaId);
  return insertContent(ctx, PRODUCT_KIND, orgId, input, {
    kind: input.kind,
    titleVi: input.titleVi,
    titleEn: input.titleEn,
    summaryVi: input.summaryVi,
    summaryEn: input.summaryEn,
    descriptionVi: cleanHtml(input.descriptionVi),
    descriptionEn: cleanHtml(input.descriptionEn),
    launchDate: input.launchDate?.date ?? null,
    launchDatePrecision: input.launchDate?.precision ?? null,
    ppStatus: input.ppStatus,
    coverMediaId: input.coverMediaId ?? null,
  });
}

export async function updateProduct(ctx: Ctx, orgId: string, id: string, raw: unknown) {
  const { version, ...patch } = parse(productPatch, raw);
  return patchContent<ProductRow, ReturnType<typeof PRODUCT_KIND.fields>>(ctx, PRODUCT_KIND, orgId, id, version, async (_p, tx) => {
    await checkImage(tx, orgId, patch.coverMediaId);
    const set: Partial<typeof t.productsProjects.$inferInsert> = {};
    if (patch.kind !== undefined) set.kind = patch.kind;
    if (patch.titleVi !== undefined) set.titleVi = patch.titleVi;
    if (patch.titleEn !== undefined) set.titleEn = patch.titleEn;
    if (patch.summaryVi !== undefined) set.summaryVi = patch.summaryVi;
    if (patch.summaryEn !== undefined) set.summaryEn = patch.summaryEn;
    if (patch.descriptionVi !== undefined) set.descriptionVi = cleanHtml(patch.descriptionVi);
    if (patch.descriptionEn !== undefined) set.descriptionEn = cleanHtml(patch.descriptionEn);
    if (patch.launchDate !== undefined) Object.assign(set, { launchDate: patch.launchDate?.date ?? null, launchDatePrecision: patch.launchDate?.precision ?? null });
    if (patch.ppStatus !== undefined) set.ppStatus = patch.ppStatus;
    if (patch.coverMediaId !== undefined) set.coverMediaId = patch.coverMediaId;
    if (patch.internalNotes !== undefined) set.internalNotes = patch.internalNotes;
    return set;
  });
}

export const deleteProduct = (ctx: Ctx, orgId: string, id: string) => deleteContent(ctx, PRODUCT_KIND, orgId, id);
export const listProducts = (ctx: Ctx, orgId: string, query: ContentListQuery = {}) => listContent(ctx, PRODUCT_KIND, orgId, query);
