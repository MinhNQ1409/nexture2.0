// Drizzle mirror of schema `core` in sql/0001_init.sql.
// The SQL file is canonical (docs/spec/02-database.sql); keep this file in sync with it.
import {
  pgSchema,
  text,
  boolean,
  timestamp,
  uuid,
  smallint,
  integer,
  bigint,
  date,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const core = pgSchema('core');

export const platformRole = core.enum('platform_role', ['USER', 'NEXTURE_ADMIN']);
export const orgRole = core.enum('org_role', ['ADMIN', 'EDITOR', 'VIEWER']);
export const contentStatus = core.enum('content_status', ['DRAFT', 'PENDING_REVIEW', 'VERIFIED']);
export const visibility = core.enum('visibility', ['PRIVATE', 'INTERNAL', 'PUBLIC']);
export const datePrecision = core.enum('date_precision', ['YEAR', 'MONTH', 'DAY']);
export const entityType = core.enum('entity_type', [
  'STORY',
  'EVENT',
  'PERSON',
  'PRODUCT_PROJECT',
  'CULTURE_VALUE',
]);
export const storyType = core.enum('story_type', ['COMPANY', 'FOUNDER', 'CULTURE', 'PEOPLE', 'PRODUCT']);
export const eventType = core.enum('event_type', [
  'FOUNDING',
  'MILESTONE',
  'PRODUCT_LAUNCH',
  'ACHIEVEMENT',
  'EXPANSION',
  'CULTURE_ACTIVITY',
  'PARTNERSHIP',
  'OTHER',
]);
export const ppKind = core.enum('pp_kind', ['PRODUCT', 'PROJECT']);
export const ppStatus = core.enum('pp_status', ['PLANNED', 'ACTIVE', 'COMPLETED', 'DISCONTINUED']);
export const employeeSize = core.enum('employee_size', ['S1_10', 'S11_50', 'S51_200', 'S201_500', 'S500_PLUS']);
export const mediaKind = core.enum('media_kind', ['IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO']);
export const uploadStatus = core.enum('upload_status', ['PENDING', 'READY']);
export const relationshipType = core.enum('relationship_type', [
  'PERSON_EVENT',
  'PERSON_PRODUCT_PROJECT',
  'PERSON_STORY',
  'EVENT_PRODUCT_PROJECT',
  'STORY_EVENT',
  'STORY_PRODUCT_PROJECT',
  'STORY_CULTURE_VALUE',
  'EVENT_CULTURE_VALUE',
]);

const tz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

// ---------------------------------------------------------------- auth (Better Auth)
// Property names follow Better Auth's field names; column names follow the SQL.
export const user = core.table('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  platformRole: platformRole('platform_role').notNull().default('USER'),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
});

export const session = core.table('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: tz('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
});

export const account = core.table('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  password: text('password'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: tz('access_token_expires_at'),
  refreshTokenExpiresAt: tz('refresh_token_expires_at'),
  scope: text('scope'),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
});

export const verification = core.table('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: tz('expires_at').notNull(),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------- organizations
export const organizations = core.table('organizations', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  slugLocked: boolean('slug_locked').notNull().default(false),
  logoMediaId: uuid('logo_media_id'),
  foundedYear: smallint('founded_year'),
  industryCode: text('industry_code'),
  employeeSize: employeeSize('employee_size'),
  provinceCode: text('province_code'),
  website: text('website'),
  shortDescVi: text('short_desc_vi'),
  shortDescEn: text('short_desc_en'),
  featuredStoryId: uuid('featured_story_id'),
  atlasEnabled: boolean('atlas_enabled').notNull().default(false),
  atlasFirstEnabledAt: tz('atlas_first_enabled_at'),
  atlasHiddenAt: tz('atlas_hidden_at'),
  atlasHiddenReason: text('atlas_hidden_reason'),
  atlasHiddenBy: text('atlas_hidden_by'),
  lockedAt: tz('locked_at'),
  lockedReason: text('locked_reason'),
  lockedBy: text('locked_by'),
  version: integer('version').notNull().default(1),
  createdBy: text('created_by').notNull(),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
});

export const organizationMembers = core.table(
  'organization_members',
  {
    organizationId: uuid('organization_id').notNull(),
    userId: text('user_id').notNull(),
    role: orgRole('role').notNull(),
    createdAt: tz('created_at').notNull().defaultNow(),
    updatedAt: tz('updated_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.organizationId, t.userId] })],
);

export const invites = core.table('invites', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  role: orgRole('role').notNull(),
  email: text('email'),
  expiresAt: tz('expires_at').notNull(),
  acceptedAt: tz('accepted_at'),
  acceptedBy: text('accepted_by'),
  revokedAt: tz('revoked_at'),
  createdBy: text('created_by').notNull(),
  createdAt: tz('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------- media
export const mediaAssets = core.table('media_assets', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  kind: mediaKind('kind').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  storageKey: text('storage_key').notNull().unique(),
  uploadStatus: uploadStatus('upload_status').notNull().default('PENDING'),
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text'),
  occurredDate: date('occurred_date'),
  occurredDatePrecision: datePrecision('occurred_date_precision'),
  sourceNote: text('source_note'),
  providedBy: text('provided_by'),
  tags: text('tags').array().notNull().default([]),
  status: contentStatus('status').notNull().default('DRAFT'),
  visibility: visibility('visibility').notNull().default('INTERNAL'),
  publicStorageKey: text('public_storage_key'),
  verifiedBy: text('verified_by'),
  verifiedAt: tz('verified_at'),
  version: integer('version').notNull().default(1),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
  deletedAt: tz('deleted_at'),
});

// ---------------------------------------------------------------- content
const workflowColumns = () => ({
  internalNotes: text('internal_notes'),
  status: contentStatus('status').notNull().default('DRAFT'),
  visibility: visibility('visibility').notNull().default('INTERNAL'),
  returnNote: text('return_note'),
  publicSlug: text('public_slug').unique(),
  verifiedBy: text('verified_by'),
  verifiedAt: tz('verified_at'),
  submittedBy: text('submitted_by'),
  submittedAt: tz('submitted_at'),
  atlasHiddenAt: tz('atlas_hidden_at'),
  atlasHiddenReason: text('atlas_hidden_reason'),
  atlasHiddenBy: text('atlas_hidden_by'),
  version: integer('version').notNull().default(1),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
  deletedAt: tz('deleted_at'),
});

export const stories = core.table('stories', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  storyType: storyType('story_type').notNull(),
  titleVi: text('title_vi').notNull(),
  titleEn: text('title_en'),
  summaryVi: text('summary_vi'),
  summaryEn: text('summary_en'),
  contentVi: text('content_vi'),
  contentEn: text('content_en'),
  storyDate: date('story_date'),
  storyDatePrecision: datePrecision('story_date_precision'),
  coverMediaId: uuid('cover_media_id'),
  ...workflowColumns(),
});

export const events = core.table('events', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  eventType: eventType('event_type').notNull().default('MILESTONE'),
  titleVi: text('title_vi').notNull(),
  titleEn: text('title_en'),
  summaryVi: text('summary_vi'),
  summaryEn: text('summary_en'),
  contentVi: text('content_vi'),
  contentEn: text('content_en'),
  startDate: date('start_date').notNull(),
  startDatePrecision: datePrecision('start_date_precision').notNull(),
  endDate: date('end_date'),
  endDatePrecision: datePrecision('end_date_precision'),
  coverMediaId: uuid('cover_media_id'),
  ...workflowColumns(),
});

export const people = core.table('people', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  fullName: text('full_name').notNull(),
  roleTitleVi: text('role_title_vi'),
  roleTitleEn: text('role_title_en'),
  isFounder: boolean('is_founder').notNull().default(false),
  joinedDate: date('joined_date'),
  joinedDatePrecision: datePrecision('joined_date_precision'),
  leftDate: date('left_date'),
  leftDatePrecision: datePrecision('left_date_precision'),
  bioVi: text('bio_vi'),
  bioEn: text('bio_en'),
  contributionsVi: text('contributions_vi'),
  contributionsEn: text('contributions_en'),
  avatarMediaId: uuid('avatar_media_id'),
  ...workflowColumns(),
});

export const productsProjects = core.table('products_projects', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  kind: ppKind('kind').notNull(),
  titleVi: text('title_vi').notNull(),
  titleEn: text('title_en'),
  summaryVi: text('summary_vi'),
  summaryEn: text('summary_en'),
  descriptionVi: text('description_vi'),
  descriptionEn: text('description_en'),
  launchDate: date('launch_date'),
  launchDatePrecision: datePrecision('launch_date_precision'),
  ppStatus: ppStatus('pp_status').notNull().default('ACTIVE'),
  coverMediaId: uuid('cover_media_id'),
  ...workflowColumns(),
});

export const cultureValues = core.table('culture_values', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  nameVi: text('name_vi').notNull(),
  nameEn: text('name_en'),
  descriptionVi: text('description_vi'),
  descriptionEn: text('description_en'),
  sortOrder: integer('sort_order').notNull().default(0),
  visibility: visibility('visibility').notNull().default('INTERNAL'),
  version: integer('version').notNull().default(1),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
  deletedAt: tz('deleted_at'),
});

// ---------------------------------------------------------------- links
export const relationships = core.table('relationships', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  relationshipType: relationshipType('relationship_type').notNull(),
  sourceType: entityType('source_type').notNull(),
  sourceId: uuid('source_id').notNull(),
  targetType: entityType('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: tz('created_at').notNull().defaultNow(),
});

export const entityMedia = core.table(
  'entity_media',
  {
    organizationId: uuid('organization_id').notNull(),
    entityType: entityType('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    mediaId: uuid('media_id').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    caption: text('caption'),
  },
  (t) => [primaryKey({ columns: [t.entityId, t.mediaId] })],
);

export const entitySources = core.table('entity_sources', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  entityType: entityType('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  mediaId: uuid('media_id'),
  url: text('url'),
  title: text('title').notNull(),
  note: text('note'),
  isPublic: boolean('is_public').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdBy: text('created_by').notNull(),
  createdAt: tz('created_at').notNull().defaultNow(),
  deletedAt: tz('deleted_at'),
});

export const activityLogs = core.table('activity_logs', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id'),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  targetLabel: text('target_label'),
  changes: jsonb('changes'),
  createdAt: tz('created_at').notNull().defaultNow(),
});
