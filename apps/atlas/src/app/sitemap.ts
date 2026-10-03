import type { MetadataRoute } from 'next';
import { atlasTables as a } from '@nexture/db';
import { db } from '@/lib/db';
import { entityHref } from '@/lib/queries';
import { SITE_URL } from '@/lib/site';

// Built per request: the build has no database, and new companies should appear without a redeploy.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/companies`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/map`, changeFrequency: 'weekly', priority: 0.6 },
  ];
  const [companies, entities] = await Promise.all([
    db().select({ slug: a.companies.slug, updatedAt: a.companies.updatedAt }).from(a.companies),
    db().select({ type: a.entities.entityType, slug: a.entities.slug, updatedAt: a.entities.updatedAt }).from(a.entities),
  ]);
  return [
    ...fixed,
    ...companies.map((c) => ({ url: `${SITE_URL}/companies/${c.slug}`, lastModified: c.updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...entities.map((e) => ({ url: SITE_URL + entityHref(e.type, e.slug), lastModified: e.updatedAt, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
