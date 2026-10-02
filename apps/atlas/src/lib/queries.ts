// All Atlas reads (07-atlas-man-hinh §11). Cached by tag; Hub calls /api/revalidate after publishing.
import 'server-only';
import { unstable_cache } from 'next/cache';
import { and, asc, desc, eq } from 'drizzle-orm';
import { atlasTables as a } from '@nexture/db';
import { db } from './db';

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

export const getEntity = (type: 'EVENT', slug: string) =>
  unstable_cache(
    async () => (await db().select().from(a.entities).where(and(eq(a.entities.entityType, type), eq(a.entities.slug, slug))))[0] ?? null,
    ['entity', type, slug],
    { tags: [`entity:/events/${slug}`], revalidate: 300 },
  )();

/** Public events of one company, oldest first (company timeline). */
export const getCompanyEvents = (orgId: string, companySlug: string) =>
  unstable_cache(
    async () =>
      db()
        .select({
          slug: a.entities.slug,
          title: a.entities.title,
          subtitle: a.entities.subtitle,
          summary: a.entities.summary,
          sortDate: a.entities.sortDate,
          datePrecision: a.entities.datePrecision,
        })
        .from(a.entities)
        .where(and(eq(a.entities.orgId, orgId), eq(a.entities.entityType, 'EVENT')))
        .orderBy(asc(a.entities.sortDate)),
    ['company-events', orgId],
    { tags: [`company:${companySlug}`], revalidate: 300 },
  )();
