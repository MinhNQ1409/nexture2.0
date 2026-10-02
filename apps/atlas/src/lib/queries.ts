// All Atlas reads (07-atlas-man-hinh §11). Cached by tag; Hub calls /api/revalidate after publishing.
import 'server-only';
import { unstable_cache } from 'next/cache';
import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { atlasTables as a } from '@nexture/db';
import { db } from './db';

export type AtlasType = 'STORY' | 'EVENT' | 'PERSON' | 'PRODUCT' | 'PROJECT';
export const PREFIX: Record<AtlasType, string> = { STORY: '/stories', EVENT: '/events', PERSON: '/people', PRODUCT: '/products', PROJECT: '/projects' };
export const entityHref = (type: string, slug: string) => `${PREFIX[type as AtlasType]}/${slug}`;

export const getCompany = (slug: string) =>
  unstable_cache(
    async () => (await db().select().from(a.companies).where(eq(a.companies.slug, slug)))[0] ?? null,
    ['company', slug],
    { tags: [`company:${slug}`], revalidate: 300 },
  )();

export const getEntity = (type: AtlasType, slug: string) =>
  unstable_cache(
    async () => (await db().select().from(a.entities).where(and(eq(a.entities.entityType, type), eq(a.entities.slug, slug))))[0] ?? null,
    ['entity', type, slug],
    { tags: [`entity:${PREFIX[type]}/${slug}`], revalidate: 300 },
  )();

const card = {
  id: a.entities.id,
  entityType: a.entities.entityType,
  slug: a.entities.slug,
  title: a.entities.title,
  subtitle: a.entities.subtitle,
  summary: a.entities.summary,
  extra: a.entities.extra,
  sortDate: a.entities.sortDate,
  datePrecision: a.entities.datePrecision,
  endDate: a.entities.endDate,
  endDatePrecision: a.entities.endDatePrecision,
  coverUrl: a.entities.coverUrl,
  coverAlt: a.entities.coverAlt,
  companyName: a.entities.companyName,
};
export type EntityCard = { id: string; entityType: string; slug: string; title: string; subtitle: string | null; summary: string | null; extra: Record<string, unknown>; sortDate: string | null; datePrecision: string | null; endDate: string | null; endDatePrecision: string | null; coverUrl: string | null; coverAlt: string | null; companyName?: string };

/** Every public item of one company, oldest first; the company page splits it by type. */
export const getCompanyEntities = (orgId: string, companySlug: string) =>
  unstable_cache(
    async () => (await db().select(card).from(a.entities).where(eq(a.entities.orgId, orgId)).orderBy(asc(a.entities.sortDate), asc(a.entities.title))) as EntityCard[],
    ['company-entities', orgId],
    { tags: [`company:${companySlug}`], revalidate: 300 },
  )();

/** Items linked to one entity (atlas.relations stores both directions). Relations are rebuilt per company, so the company tag covers them. */
export const getRelated = (id: string, companySlug: string) =>
  unstable_cache(
    async () =>
      (await db()
        .select(card)
        .from(a.relations)
        .innerJoin(a.entities, eq(a.entities.id, a.relations.toId))
        .where(eq(a.relations.fromId, id))
        .orderBy(asc(a.entities.sortDate), asc(a.entities.title))) as EntityCard[],
    ['related', id],
    { tags: [`company:${companySlug}`], revalidate: 300 },
  )();

export type GalleryItem = { id: string; kind: 'IMAGE' | 'VIDEO'; url: string; mimeType: string; width: number | null; height: number | null; alt: string | null; title: string; caption: string | null };

/** Public gallery of one entity, in Hub order. Media sync re-projects the whole company, so the company tag covers it. */
export const getGallery = (id: string, companySlug: string) =>
  unstable_cache(
    async () =>
      (await db()
        .select({
          id: a.media.id,
          kind: a.media.kind,
          url: a.media.url,
          mimeType: a.media.mimeType,
          width: a.media.width,
          height: a.media.height,
          alt: a.media.alt,
          title: a.media.title,
          caption: a.entityMedia.caption,
        })
        .from(a.entityMedia)
        .innerJoin(a.media, eq(a.media.id, a.entityMedia.mediaId))
        .where(eq(a.entityMedia.entityId, id))
        .orderBy(asc(a.entityMedia.sortOrder))) as GalleryItem[],
    ['gallery', id],
    { tags: [`company:${companySlug}`], revalidate: 300 },
  )();

/** Home page blocks (07 §1). One cache entry under the `home` tag. */
export const getHome = unstable_cache(
  async () => {
    const d = db();
    const latest = (types: string[], limit = 6) =>
      d
        .select(card)
        .from(a.entities)
        .where(inArray(a.entities.entityType, types as AtlasType[]))
        .orderBy(desc(a.entities.publishedAt))
        .limit(limit) as Promise<EntityCard[]>;
    const [featured, newest, stories, people, products, [totals]] = await Promise.all([
      d.select().from(a.companies).orderBy(desc(a.companies.publicEntityCount), desc(a.companies.updatedAt)).limit(6),
      d.select().from(a.companies).orderBy(desc(a.companies.firstPublishedAt)).limit(6),
      latest(['STORY']),
      d
        .select(card)
        .from(a.entities)
        .where(eq(a.entities.entityType, 'PERSON'))
        .orderBy(sql`(${a.entities.extra}->>'isFounder')::boolean IS TRUE DESC`, desc(a.entities.publishedAt))
        .limit(6) as Promise<EntityCard[]>,
      latest(['PRODUCT', 'PROJECT']),
      d
        .select({
          companies: sql<number>`(SELECT count(*)::int FROM atlas.companies)`,
          stories: sql<number>`(SELECT count(*)::int FROM atlas.entities WHERE entity_type = 'STORY')`,
        })
        .from(sql`(SELECT 1) AS one`),
    ]);
    return { featured, newest, stories, people, products, totals: totals ?? { companies: 0, stories: 0 } };
  },
  ['home'],
  { tags: ['home'], revalidate: 300 },
);

export type CompanyQuery = { industry: string[]; province: string[]; from?: number; to?: number; q?: string; sort: 'new' | 'name' | 'founded'; page: number };
export const COMPANY_PAGE = 24;

/** Explore (07 §2): filtered company list, not cached. */
export async function findCompanies(f: CompanyQuery) {
  const c = a.companies;
  const conds = [
    f.industry.length ? inArray(c.industryCode, f.industry) : undefined,
    f.province.length ? inArray(c.provinceCode, f.province) : undefined,
    f.from ? sql`${c.foundedYear} >= ${f.from}` : undefined,
    f.to ? sql`${c.foundedYear} <= ${f.to}` : undefined,
    f.q && f.q.length >= 2 ? sql`${c.searchText} LIKE '%' || atlas.f_search_norm(${f.q}) || '%'` : undefined,
  ];
  const where = and(...conds);
  const order = f.sort === 'name' ? [asc(c.name)] : f.sort === 'founded' ? [sql`${c.foundedYear} ASC NULLS LAST`, asc(c.name)] : [desc(c.firstPublishedAt)];
  const [[{ total } = { total: 0 }], items] = await Promise.all([
    db().select({ total: count() }).from(c).where(where),
    db()
      .select()
      .from(c)
      .where(where)
      .orderBy(...order)
      .limit(COMPANY_PAGE)
      .offset((f.page - 1) * COMPANY_PAGE),
  ]);
  return { total, items };
}

/** Industries and provinces that have at least one company, with counts, for the filter lists. */
export const getFacets = unstable_cache(
  async () => {
    const c = a.companies;
    const [industries, provinces] = await Promise.all([
      db()
        .select({ code: c.industryCode, name: c.industryName, n: count() })
        .from(c)
        .where(sql`${c.industryCode} IS NOT NULL`)
        .groupBy(c.industryCode, c.industryName)
        .orderBy(asc(c.industryName)),
      db()
        .select({ code: c.provinceCode, name: c.provinceName, n: count() })
        .from(c)
        .where(sql`${c.provinceCode} IS NOT NULL`)
        .groupBy(c.provinceCode, c.provinceName)
        .orderBy(asc(c.provinceName)),
    ]);
    return { industries: industries as { code: string; name: string; n: number }[], provinces: provinces as { code: string; name: string; n: number }[] };
  },
  ['company-facets'],
  { tags: ['companies'], revalidate: 300 },
);
