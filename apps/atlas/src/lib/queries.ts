// All Atlas reads (07-atlas-man-hinh §11). Cached by tag; Hub calls /api/revalidate after publishing.
import 'server-only';
import { unstable_cache } from 'next/cache';
import { and, asc, desc, eq } from 'drizzle-orm';
import { atlasTables as a } from '@nexture/db';
import { db } from './db';

export type AtlasType = 'STORY' | 'EVENT' | 'PERSON' | 'PRODUCT' | 'PROJECT';
export const PREFIX: Record<AtlasType, string> = { STORY: '/stories', EVENT: '/events', PERSON: '/people', PRODUCT: '/products', PROJECT: '/projects' };
export const entityHref = (type: string, slug: string) => `${PREFIX[type as AtlasType]}/${slug}`;

export const getCompanies = unstable_cache(
  async () => db().select().from(a.companies).orderBy(desc(a.companies.firstPublishedAt)).limit(24),
  ['companies'],
  { tags: ['companies', 'home'], revalidate: 300 },
);

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
};
export type EntityCard = { id: string; entityType: string; slug: string; title: string; subtitle: string | null; summary: string | null; extra: Record<string, unknown>; sortDate: string | null; datePrecision: string | null; endDate: string | null; endDatePrecision: string | null };

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
