// Atlas search (07 §8): not cached, reads only schema atlas.
import 'server-only';
import { and, count, desc, inArray, sql, type SQL } from 'drizzle-orm';
import { atlasTables as a } from '@nexture/db';
import { db } from './db';
import type { AtlasType, EntityCard } from './queries';

export const SEARCH_TYPES = { company: null, story: ['STORY'], event: ['EVENT'], person: ['PERSON'], product: ['PRODUCT', 'PROJECT'], project: ['PROJECT'] } as const;
export type SearchType = keyof typeof SEARCH_TYPES;

const like = (col: unknown, q: string) => sql`${col} LIKE '%' || atlas.f_search_norm(${q}) || '%'`;
const startsFirst = (col: unknown, q: string) => sql`(atlas.f_search_norm(${col}) LIKE atlas.f_search_norm(${q}) || '%') DESC`;

export async function searchCompanies(q: string, limit: number, offset = 0) {
  const where = like(a.companies.searchText, q);
  const [{ total } = { total: 0 }] = await db().select({ total: count() }).from(a.companies).where(where);
  const items = await db()
    .select()
    .from(a.companies)
    .where(where)
    .orderBy(startsFirst(a.companies.name, q), desc(a.companies.updatedAt))
    .limit(limit)
    .offset(offset);
  return { total, items };
}

export async function searchEntities(q: string, types: readonly AtlasType[], limit: number, offset = 0) {
  const where: SQL = and(like(a.entities.searchText, q), inArray(a.entities.entityType, [...types]))!;
  const [{ total } = { total: 0 }] = await db().select({ total: count() }).from(a.entities).where(where);
  const items = await db()
    .select({
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
    })
    .from(a.entities)
    .where(where)
    .orderBy(startsFirst(a.entities.title, q), desc(a.entities.updatedAt))
    .limit(limit)
    .offset(offset);
  return { total, items: items as (EntityCard & { companyName: string })[] };
}

