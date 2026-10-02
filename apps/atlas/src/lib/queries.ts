// All Atlas reads (07-atlas-man-hinh §11). Cached by tag; Hub calls /api/revalidate after publishing.
import 'server-only';
import { unstable_cache } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
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
