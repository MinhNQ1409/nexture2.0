// Drizzle mirror of schema `atlas` (public projection). Atlas app imports ONLY this file.
import { pgSchema, text, uuid, smallint, integer, date, jsonb, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const atlas = pgSchema('atlas');

const tz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

export const companies = atlas.table('companies', {
  orgId: uuid('org_id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  foundedYear: smallint('founded_year'),
  industryCode: text('industry_code'),
  industryName: text('industry_name'),
  employeeSize: text('employee_size'),
  provinceCode: text('province_code'),
  provinceName: text('province_name'),
  website: text('website'),
  shortDesc: text('short_desc'),
  featuredStorySlug: text('featured_story_slug'),
  cultureValues: jsonb('culture_values').$type<{ name: string; description: string | null }[]>().notNull(),
  publicEntityCount: integer('public_entity_count').notNull().default(0),
  firstPublishedAt: tz('first_published_at').notNull(),
  updatedAt: tz('updated_at').notNull(),
  searchText: text('search_text').notNull(),
  en: jsonb('en').$type<CompanyEn>().notNull().default({}),
});

export type CompanyEn = { shortDesc?: string; cultureValues?: { name: string; description: string | null }[]; industryName?: string; provinceName?: string };
export type EntityEn = { title?: string; subtitle?: string; summary?: string; bodyHtml?: string; extra?: Record<string, unknown> };

export type AtlasEntityType = 'STORY' | 'EVENT' | 'PERSON' | 'PRODUCT' | 'PROJECT';

export const entities = atlas.table('entities', {
  id: uuid('id').primaryKey(),
  entityType: text('entity_type').$type<AtlasEntityType>().notNull(),
  slug: text('slug').notNull(),
  orgId: uuid('org_id').notNull(),
  companySlug: text('company_slug').notNull(),
  companyName: text('company_name').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  summary: text('summary'),
  bodyHtml: text('body_html'),
  extra: jsonb('extra').$type<Record<string, unknown>>().notNull(),
  sortDate: date('sort_date'),
  datePrecision: text('date_precision'),
  endDate: date('end_date'),
  endDatePrecision: text('end_date_precision'),
  coverUrl: text('cover_url'),
  coverAlt: text('cover_alt'),
  sources: jsonb('sources').$type<{ title: string; url: string | null; note: string | null }[]>().notNull(),
  publishedAt: tz('published_at').notNull(),
  updatedAt: tz('updated_at').notNull(),
  searchText: text('search_text').notNull(),
  en: jsonb('en').$type<EntityEn>().notNull().default({}),
});

export const relations = atlas.table(
  'relations',
  { fromId: uuid('from_id').notNull(), toId: uuid('to_id').notNull() },
  (t) => [primaryKey({ columns: [t.fromId, t.toId] })],
);

export const media = atlas.table('media', {
  id: uuid('id').primaryKey(),
  orgId: uuid('org_id').notNull(),
  kind: text('kind').$type<'IMAGE' | 'VIDEO'>().notNull(),
  url: text('url').notNull(),
  mimeType: text('mime_type').notNull(),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt'),
  title: text('title').notNull(),
});

export const entityMedia = atlas.table(
  'entity_media',
  {
    entityId: uuid('entity_id').notNull(),
    mediaId: uuid('media_id').notNull(),
    sortOrder: integer('sort_order').notNull(),
    caption: text('caption'),
  },
  (t) => [primaryKey({ columns: [t.entityId, t.mediaId] })],
);

export const tombstones = atlas.table('tombstones', {
  path: text('path').primaryKey(),
  removedAt: tz('removed_at').notNull(),
});
