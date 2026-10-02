-- =====================================================================
-- NexTure MVP — DDL PostgreSQL 16+
-- Nguồn chuẩn cho schema. Drizzle schema (packages/db) PHẢI sinh ra
-- migration tương đương file này. Mọi thay đổi schema sửa file này trước.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS atlas;

-- unaccent() không IMMUTABLE nên không dùng được trong index; bọc lại.
CREATE OR REPLACE FUNCTION core.f_unaccent(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;

-- Chuẩn hóa chuỗi để tìm kiếm: bỏ dấu, chữ thường, đ -> d.
CREATE OR REPLACE FUNCTION core.f_search_norm(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE
  AS $$ SELECT lower(replace(replace(core.f_unaccent(coalesce($1,'')), 'đ', 'd'), 'Đ', 'D')) $$;

-- ---------------------------------------------------------------------
-- ENUM
-- ---------------------------------------------------------------------
CREATE TYPE core.platform_role     AS ENUM ('USER', 'NEXTURE_ADMIN');
CREATE TYPE core.org_role          AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE core.content_status    AS ENUM ('DRAFT', 'PENDING_REVIEW', 'VERIFIED');
CREATE TYPE core.visibility        AS ENUM ('PRIVATE', 'INTERNAL', 'PUBLIC');
CREATE TYPE core.date_precision    AS ENUM ('YEAR', 'MONTH', 'DAY');
CREATE TYPE core.entity_type       AS ENUM ('STORY', 'EVENT', 'PERSON', 'PRODUCT_PROJECT', 'CULTURE_VALUE');
CREATE TYPE core.story_type        AS ENUM ('COMPANY', 'FOUNDER', 'CULTURE', 'PEOPLE', 'PRODUCT');
CREATE TYPE core.event_type        AS ENUM ('FOUNDING', 'MILESTONE', 'PRODUCT_LAUNCH', 'ACHIEVEMENT',
                                            'EXPANSION', 'CULTURE_ACTIVITY', 'PARTNERSHIP', 'OTHER');
CREATE TYPE core.pp_kind           AS ENUM ('PRODUCT', 'PROJECT');
CREATE TYPE core.pp_status         AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'DISCONTINUED');
CREATE TYPE core.employee_size     AS ENUM ('S1_10', 'S11_50', 'S51_200', 'S201_500', 'S500_PLUS');
CREATE TYPE core.media_kind        AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO');
CREATE TYPE core.upload_status     AS ENUM ('PENDING', 'READY');
CREATE TYPE core.relationship_type AS ENUM (
  'PERSON_EVENT',            -- Person tham gia Event
  'PERSON_PRODUCT_PROJECT',  -- Person đóng góp cho Product/Project
  'PERSON_STORY',            -- Person xuất hiện trong Story
  'EVENT_PRODUCT_PROJECT',   -- Event liên quan Product/Project
  'STORY_EVENT',             -- Story nói về Event
  'STORY_PRODUCT_PROJECT',   -- Story nói về Product/Project
  'STORY_CULTURE_VALUE',     -- Story thể hiện giá trị
  'EVENT_CULTURE_VALUE'      -- Event thể hiện giá trị
);

-- ---------------------------------------------------------------------
-- AUTH (Better Auth). Sinh bằng `npx @better-auth/cli generate` với
-- Drizzle adapter, schema 'core'. Bảng dưới đây là tham chiếu; nếu CLI
-- sinh khác tên cột thì theo CLI, nhưng PHẢI có thêm cột platform_role
-- (khai báo user.additionalFields trong cấu hình Better Auth, input: false).
-- ---------------------------------------------------------------------
CREATE TABLE core."user" (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  email           text NOT NULL UNIQUE,
  email_verified  boolean NOT NULL DEFAULT false,
  image           text,
  platform_role   core.platform_role NOT NULL DEFAULT 'USER',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE core.session (
  id          text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES core."user"(id) ON DELETE CASCADE,
  token       text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE core.account (
  id                        text PRIMARY KEY,
  user_id                   text NOT NULL REFERENCES core."user"(id) ON DELETE CASCADE,
  account_id                text NOT NULL,
  provider_id               text NOT NULL,
  password                  text,
  access_token              text,
  refresh_token             text,
  id_token                  text,
  access_token_expires_at   timestamptz,
  refresh_token_expires_at  timestamptz,
  scope                     text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE core.verification (
  id          text PRIMARY KEY,
  identifier  text NOT NULL,
  value       text NOT NULL,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- TỔ CHỨC
-- ---------------------------------------------------------------------
CREATE TABLE core.organizations (
  id                        uuid PRIMARY KEY,
  name                      text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  slug                      text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) BETWEEN 2 AND 80),
  slug_locked               boolean NOT NULL DEFAULT false,      -- true sau lần đầu bật Atlas
  logo_media_id             uuid,                                -- FK thêm sau khi tạo media_assets
  founded_year              smallint CHECK (founded_year BETWEEN 1800 AND 2100),
  industry_code             text,                                -- danh mục INDUSTRIES (02-ghi-chu §3)
  employee_size             core.employee_size,
  province_code             text,                                -- danh mục PROVINCES (02-ghi-chu §4)
  website                   text CHECK (website IS NULL OR website ~ '^https?://'),
  short_desc_vi             text CHECK (short_desc_vi IS NULL OR char_length(short_desc_vi) <= 300),
  short_desc_en             text CHECK (short_desc_en IS NULL OR char_length(short_desc_en) <= 300),
  featured_story_id         uuid,                                -- FK thêm sau khi tạo stories
  atlas_enabled             boolean NOT NULL DEFAULT false,
  atlas_first_enabled_at    timestamptz,
  atlas_hidden_at           timestamptz,
  atlas_hidden_reason       text,
  atlas_hidden_by           text REFERENCES core."user"(id),
  version                   integer NOT NULL DEFAULT 1,
  created_by                text NOT NULL REFERENCES core."user"(id),
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE core.organization_members (
  organization_id  uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  user_id          text NOT NULL REFERENCES core."user"(id) ON DELETE CASCADE,
  role             core.org_role NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);
CREATE INDEX ON core.organization_members (user_id);

CREATE TABLE core.invites (
  id               uuid PRIMARY KEY,
  organization_id  uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  token_hash       text NOT NULL UNIQUE,          -- sha256 hex của token; token gốc chỉ trả 1 lần
  role             core.org_role NOT NULL,
  email            text,                           -- nếu có: chỉ email này nhận được
  expires_at       timestamptz NOT NULL,
  accepted_at      timestamptz,
  accepted_by      text REFERENCES core."user"(id),
  revoked_at       timestamptz,
  created_by       text NOT NULL REFERENCES core."user"(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON core.invites (organization_id);

-- ---------------------------------------------------------------------
-- TƯ LIỆU (Culture Library)
-- ---------------------------------------------------------------------
CREATE TABLE core.media_assets (
  id                uuid PRIMARY KEY,
  organization_id   uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  kind              core.media_kind NOT NULL,
  title             text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  description       text CHECK (description IS NULL OR char_length(description) <= 2000),
  original_filename text NOT NULL,
  mime_type         text NOT NULL,
  size_bytes        bigint NOT NULL CHECK (size_bytes > 0),
  storage_key       text NOT NULL UNIQUE,          -- key trong bucket private
  upload_status     core.upload_status NOT NULL DEFAULT 'PENDING',
  width             integer,                       -- ảnh: client gửi khi complete
  height            integer,
  alt_text          text CHECK (alt_text IS NULL OR char_length(alt_text) <= 300),
  occurred_date            date,                  -- "ngày xảy ra sự kiện nếu có"
  occurred_date_precision  core.date_precision,
  source_note       text CHECK (source_note IS NULL OR char_length(source_note) <= 500),   -- "Nguồn"
  provided_by       text CHECK (provided_by IS NULL OR char_length(provided_by) <= 200),   -- "Người cung cấp"
  tags              text[] NOT NULL DEFAULT '{}',
  status            core.content_status NOT NULL DEFAULT 'DRAFT',   -- "trạng thái xác minh"
  visibility        core.visibility NOT NULL DEFAULT 'INTERNAL',
  public_storage_key text,                         -- key trong bucket public khi đang được công khai
  verified_by       text REFERENCES core."user"(id),
  verified_at       timestamptz,
  version           integer NOT NULL DEFAULT 1,
  created_by        text NOT NULL REFERENCES core."user"(id),
  updated_by        text NOT NULL REFERENCES core."user"(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,
  CHECK ((occurred_date IS NULL) = (occurred_date_precision IS NULL))
);
CREATE INDEX ON core.media_assets (organization_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX ON core.media_assets USING gin (core.f_search_norm(title) gin_trgm_ops);
CREATE INDEX ON core.media_assets USING gin (tags);

ALTER TABLE core.organizations
  ADD CONSTRAINT organizations_logo_fk FOREIGN KEY (logo_media_id) REFERENCES core.media_assets(id);

-- ---------------------------------------------------------------------
-- NỘI DUNG
-- Cột chung cho stories/events/people/products_projects:
--   status, visibility, public_slug, version, verified_*, atlas_hidden_*,
--   created_*/updated_*/deleted_at, internal_notes
-- ---------------------------------------------------------------------
CREATE TABLE core.stories (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  story_type           core.story_type NOT NULL,
  title_vi             text NOT NULL CHECK (char_length(title_vi) BETWEEN 1 AND 200),
  title_en             text CHECK (title_en IS NULL OR char_length(title_en) <= 200),
  summary_vi           text CHECK (summary_vi IS NULL OR char_length(summary_vi) <= 500),
  summary_en           text CHECK (summary_en IS NULL OR char_length(summary_en) <= 500),
  content_vi           text,                       -- HTML đã sanitize, ≤ 100.000 ký tự
  content_en           text,
  story_date           date,
  story_date_precision core.date_precision,
  cover_media_id       uuid REFERENCES core.media_assets(id),
  internal_notes       text CHECK (internal_notes IS NULL OR char_length(internal_notes) <= 5000),
  status               core.content_status NOT NULL DEFAULT 'DRAFT',
  visibility           core.visibility NOT NULL DEFAULT 'INTERNAL',
  return_note          text,                       -- lý do Admin trả lại về DRAFT
  public_slug          text UNIQUE,                -- gán lần đầu công khai, không đổi
  verified_by          text REFERENCES core."user"(id),
  verified_at          timestamptz,
  submitted_by         text REFERENCES core."user"(id),
  submitted_at         timestamptz,
  atlas_hidden_at      timestamptz,
  atlas_hidden_reason  text,
  atlas_hidden_by      text REFERENCES core."user"(id),
  version              integer NOT NULL DEFAULT 1,
  created_by           text NOT NULL REFERENCES core."user"(id),
  updated_by           text NOT NULL REFERENCES core."user"(id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz,
  CHECK ((story_date IS NULL) = (story_date_precision IS NULL)),
  CHECK (content_vi IS NULL OR char_length(content_vi) <= 100000)
);
CREATE INDEX ON core.stories (organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX ON core.stories USING gin (core.f_search_norm(title_vi || ' ' || coalesce(summary_vi,'')) gin_trgm_ops);

ALTER TABLE core.organizations
  ADD CONSTRAINT organizations_featured_story_fk FOREIGN KEY (featured_story_id) REFERENCES core.stories(id) ON DELETE SET NULL;

CREATE TABLE core.events (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  event_type           core.event_type NOT NULL DEFAULT 'MILESTONE',
  title_vi             text NOT NULL CHECK (char_length(title_vi) BETWEEN 1 AND 200),
  title_en             text CHECK (title_en IS NULL OR char_length(title_en) <= 200),
  summary_vi           text CHECK (summary_vi IS NULL OR char_length(summary_vi) <= 500),
  summary_en           text CHECK (summary_en IS NULL OR char_length(summary_en) <= 500),
  content_vi           text CHECK (content_vi IS NULL OR char_length(content_vi) <= 100000),
  content_en           text,
  start_date           date NOT NULL,
  start_date_precision core.date_precision NOT NULL,
  end_date             date,
  end_date_precision   core.date_precision,
  cover_media_id       uuid REFERENCES core.media_assets(id),
  internal_notes       text CHECK (internal_notes IS NULL OR char_length(internal_notes) <= 5000),
  status               core.content_status NOT NULL DEFAULT 'DRAFT',
  visibility           core.visibility NOT NULL DEFAULT 'INTERNAL',
  return_note          text,
  public_slug          text UNIQUE,
  verified_by          text REFERENCES core."user"(id),
  verified_at          timestamptz,
  submitted_by         text REFERENCES core."user"(id),
  submitted_at         timestamptz,
  atlas_hidden_at      timestamptz,
  atlas_hidden_reason  text,
  atlas_hidden_by      text REFERENCES core."user"(id),
  version              integer NOT NULL DEFAULT 1,
  created_by           text NOT NULL REFERENCES core."user"(id),
  updated_by           text NOT NULL REFERENCES core."user"(id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz,
  CHECK ((end_date IS NULL) = (end_date_precision IS NULL)),
  CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX ON core.events (organization_id, start_date) WHERE deleted_at IS NULL;
CREATE INDEX ON core.events USING gin (core.f_search_norm(title_vi || ' ' || coalesce(summary_vi,'')) gin_trgm_ops);

CREATE TABLE core.people (
  id                    uuid PRIMARY KEY,
  organization_id       uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  full_name             text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 150),
  role_title_vi         text CHECK (role_title_vi IS NULL OR char_length(role_title_vi) <= 150),
  role_title_en         text CHECK (role_title_en IS NULL OR char_length(role_title_en) <= 150),
  is_founder            boolean NOT NULL DEFAULT false,
  joined_date           date,
  joined_date_precision core.date_precision,
  left_date             date,
  left_date_precision   core.date_precision,
  bio_vi                text CHECK (bio_vi IS NULL OR char_length(bio_vi) <= 50000),     -- HTML
  bio_en                text,
  contributions_vi      text CHECK (contributions_vi IS NULL OR char_length(contributions_vi) <= 20000), -- HTML
  contributions_en      text,
  avatar_media_id       uuid REFERENCES core.media_assets(id),
  internal_notes        text CHECK (internal_notes IS NULL OR char_length(internal_notes) <= 5000),
  status                core.content_status NOT NULL DEFAULT 'DRAFT',
  visibility            core.visibility NOT NULL DEFAULT 'INTERNAL',
  return_note           text,
  public_slug           text UNIQUE,
  verified_by           text REFERENCES core."user"(id),
  verified_at           timestamptz,
  submitted_by          text REFERENCES core."user"(id),
  submitted_at          timestamptz,
  atlas_hidden_at       timestamptz,
  atlas_hidden_reason   text,
  atlas_hidden_by       text REFERENCES core."user"(id),
  version               integer NOT NULL DEFAULT 1,
  created_by            text NOT NULL REFERENCES core."user"(id),
  updated_by            text NOT NULL REFERENCES core."user"(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,
  CHECK ((joined_date IS NULL) = (joined_date_precision IS NULL)),
  CHECK ((left_date IS NULL) = (left_date_precision IS NULL)),
  CHECK (left_date IS NULL OR joined_date IS NULL OR left_date >= joined_date)
);
CREATE INDEX ON core.people (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX ON core.people USING gin (core.f_search_norm(full_name) gin_trgm_ops);

CREATE TABLE core.products_projects (
  id                    uuid PRIMARY KEY,
  organization_id       uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  kind                  core.pp_kind NOT NULL,
  title_vi              text NOT NULL CHECK (char_length(title_vi) BETWEEN 1 AND 200),
  title_en              text CHECK (title_en IS NULL OR char_length(title_en) <= 200),
  summary_vi            text CHECK (summary_vi IS NULL OR char_length(summary_vi) <= 500),
  summary_en            text CHECK (summary_en IS NULL OR char_length(summary_en) <= 500),
  description_vi        text CHECK (description_vi IS NULL OR char_length(description_vi) <= 100000), -- HTML
  description_en        text,
  launch_date           date,
  launch_date_precision core.date_precision,
  pp_status             core.pp_status NOT NULL DEFAULT 'ACTIVE',
  cover_media_id        uuid REFERENCES core.media_assets(id),
  internal_notes        text CHECK (internal_notes IS NULL OR char_length(internal_notes) <= 5000),
  status                core.content_status NOT NULL DEFAULT 'DRAFT',
  visibility            core.visibility NOT NULL DEFAULT 'INTERNAL',
  return_note           text,
  public_slug           text UNIQUE,
  verified_by           text REFERENCES core."user"(id),
  verified_at           timestamptz,
  submitted_by          text REFERENCES core."user"(id),
  submitted_at          timestamptz,
  atlas_hidden_at       timestamptz,
  atlas_hidden_reason   text,
  atlas_hidden_by       text REFERENCES core."user"(id),
  version               integer NOT NULL DEFAULT 1,
  created_by            text NOT NULL REFERENCES core."user"(id),
  updated_by            text NOT NULL REFERENCES core."user"(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,
  CHECK ((launch_date IS NULL) = (launch_date_precision IS NULL))
);
CREATE INDEX ON core.products_projects (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX ON core.products_projects USING gin (core.f_search_norm(title_vi || ' ' || coalesce(summary_vi,'')) gin_trgm_ops);

-- Giá trị văn hóa: chỉ Admin quản lý, không có luồng xác minh (luôn coi là VERIFIED).
CREATE TABLE core.culture_values (
  id               uuid PRIMARY KEY,
  organization_id  uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  name_vi          text NOT NULL CHECK (char_length(name_vi) BETWEEN 1 AND 100),
  name_en          text CHECK (name_en IS NULL OR char_length(name_en) <= 100),
  description_vi   text CHECK (description_vi IS NULL OR char_length(description_vi) <= 1000), -- văn bản thuần
  description_en   text CHECK (description_en IS NULL OR char_length(description_en) <= 1000),
  sort_order       integer NOT NULL DEFAULT 0,
  visibility       core.visibility NOT NULL DEFAULT 'INTERNAL',   -- chỉ INTERNAL hoặc PUBLIC
  version          integer NOT NULL DEFAULT 1,
  created_by       text NOT NULL REFERENCES core."user"(id),
  updated_by       text NOT NULL REFERENCES core."user"(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,
  CHECK (visibility IN ('INTERNAL', 'PUBLIC'))
);
CREATE UNIQUE INDEX ON core.culture_values (organization_id, lower(name_vi)) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------
-- LIÊN KẾT
-- ---------------------------------------------------------------------
-- Quan hệ giữa hai nội dung. Chiều luôn chuẩn hóa theo relationship_type
-- (source_type/target_type cố định theo bảng ở 02-ghi-chu §6).
-- Không có FK cứng vì đa hình; toàn vẹn do core đảm bảo.
CREATE TABLE core.relationships (
  id                 uuid PRIMARY KEY,
  organization_id    uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  relationship_type  core.relationship_type NOT NULL,
  source_type        core.entity_type NOT NULL,
  source_id          uuid NOT NULL,
  target_type        core.entity_type NOT NULL,
  target_id          uuid NOT NULL,
  created_by         text NOT NULL REFERENCES core."user"(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (source_id <> target_id),
  UNIQUE (relationship_type, source_id, target_id)
);
CREATE INDEX ON core.relationships (organization_id, source_id);
CREATE INDEX ON core.relationships (organization_id, target_id);

-- Ảnh/video hiển thị kèm một nội dung (ngoài ảnh bìa).
CREATE TABLE core.entity_media (
  organization_id  uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  entity_type      core.entity_type NOT NULL,
  entity_id        uuid NOT NULL,
  media_id         uuid NOT NULL REFERENCES core.media_assets(id),
  sort_order       integer NOT NULL DEFAULT 0,
  caption          text CHECK (caption IS NULL OR char_length(caption) <= 300),
  PRIMARY KEY (entity_id, media_id),
  CHECK (entity_type IN ('STORY', 'EVENT', 'PERSON', 'PRODUCT_PROJECT'))
);
CREATE INDEX ON core.entity_media (media_id);

-- Nguồn / bằng chứng: tư liệu trong Library hoặc link ngoài.
CREATE TABLE core.entity_sources (
  id               uuid PRIMARY KEY,
  organization_id  uuid NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
  entity_type      core.entity_type NOT NULL,
  entity_id        uuid NOT NULL,
  media_id         uuid REFERENCES core.media_assets(id),
  url              text CHECK (url IS NULL OR url ~ '^https?://'),
  title            text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  note             text CHECK (note IS NULL OR char_length(note) <= 1000),
  is_public        boolean NOT NULL DEFAULT false,   -- hiện ở mục "Nguồn" trên Atlas
  sort_order       integer NOT NULL DEFAULT 0,
  created_by       text NOT NULL REFERENCES core."user"(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,
  CHECK ((media_id IS NULL) <> (url IS NULL)),       -- đúng một trong hai
  CHECK (entity_type IN ('STORY', 'EVENT', 'PERSON', 'PRODUCT_PROJECT'))
);
CREATE INDEX ON core.entity_sources (entity_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------
-- NHẬT KÝ HOẠT ĐỘNG
-- ---------------------------------------------------------------------
CREATE TABLE core.activity_logs (
  id               uuid PRIMARY KEY,
  organization_id  uuid REFERENCES core.organizations(id) ON DELETE CASCADE, -- NULL cho hành động cấp nền tảng
  actor_id         text REFERENCES core."user"(id),
  action           text NOT NULL,                 -- danh mục ở 02-ghi-chu §8
  target_type      text NOT NULL,                 -- ORGANIZATION | MEMBER | INVITE | MEDIA | STORY | ...
  target_id        text NOT NULL,
  target_label     text,                          -- tiêu đề tại thời điểm ghi, để hiển thị
  changes          jsonb,                         -- {field: [before, after]} cho các trường thay đổi
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON core.activity_logs (organization_id, created_at DESC);

-- =====================================================================
-- SCHEMA ATLAS (projection công khai). Chỉ packages/core/src/public/sync.ts ghi.
-- Không chứa cột internal_notes, status, created_by... chỉ dữ liệu đã lọc.
-- =====================================================================
CREATE TABLE atlas.companies (
  org_id               uuid PRIMARY KEY,
  slug                 text NOT NULL UNIQUE,
  name                 text NOT NULL,
  logo_url             text,
  founded_year         smallint,
  industry_code        text,
  industry_name        text,
  employee_size        text,
  province_code        text,
  province_name        text,
  website              text,
  short_desc           text,
  featured_story_slug  text,
  culture_values       jsonb NOT NULL DEFAULT '[]',   -- [{name, description}] theo sort_order
  public_entity_count  integer NOT NULL DEFAULT 0,
  first_published_at   timestamptz NOT NULL,
  updated_at           timestamptz NOT NULL,
  search_text          text NOT NULL                   -- f_search_norm(name + short_desc + industry + province)
);
CREATE INDEX ON atlas.companies USING gin (search_text gin_trgm_ops);
CREATE INDEX ON atlas.companies (industry_code);
CREATE INDEX ON atlas.companies (province_code);
CREATE INDEX ON atlas.companies (founded_year);

CREATE TABLE atlas.entities (
  id              uuid PRIMARY KEY,                    -- = id trong core
  entity_type     text NOT NULL CHECK (entity_type IN ('STORY','EVENT','PERSON','PRODUCT','PROJECT')),
  slug            text NOT NULL,
  org_id          uuid NOT NULL REFERENCES atlas.companies(org_id) ON DELETE CASCADE,
  company_slug    text NOT NULL,
  company_name    text NOT NULL,
  title           text NOT NULL,                       -- Story/Event/Product: title_vi; Person: full_name
  subtitle        text,                                -- Person: role_title; Story: story_type label; Event: event_type label
  summary         text,
  body_html       text,                                -- content/description/bio đã sanitize
  extra           jsonb NOT NULL DEFAULT '{}',         -- trường riêng theo loại (08-cong-khai §3)
  sort_date       date,
  date_precision  text,
  end_date        date,
  end_date_precision text,
  cover_url       text,
  cover_alt       text,
  sources         jsonb NOT NULL DEFAULT '[]',         -- [{title, url, note}] chỉ nguồn is_public
  published_at    timestamptz NOT NULL,                -- lần đầu xuất hiện trên Atlas
  updated_at      timestamptz NOT NULL,
  search_text     text NOT NULL,
  UNIQUE (entity_type, slug)
);
CREATE INDEX ON atlas.entities (org_id, entity_type, sort_date);
CREATE INDEX ON atlas.entities USING gin (search_text gin_trgm_ops);

CREATE TABLE atlas.relations (
  from_id    uuid NOT NULL REFERENCES atlas.entities(id) ON DELETE CASCADE,
  to_id      uuid NOT NULL REFERENCES atlas.entities(id) ON DELETE CASCADE,
  PRIMARY KEY (from_id, to_id)
);                                                      -- lưu CẢ HAI chiều để truy vấn đơn giản
CREATE INDEX ON atlas.relations (to_id);

CREATE TABLE atlas.media (
  id          uuid PRIMARY KEY,                         -- = media_assets.id
  org_id      uuid NOT NULL REFERENCES atlas.companies(org_id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('IMAGE','VIDEO')),
  url         text NOT NULL,
  mime_type   text NOT NULL,
  width       integer,
  height      integer,
  alt         text,
  title       text NOT NULL
);

CREATE TABLE atlas.entity_media (
  entity_id   uuid NOT NULL REFERENCES atlas.entities(id) ON DELETE CASCADE,
  media_id    uuid NOT NULL REFERENCES atlas.media(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL,
  caption     text,
  PRIMARY KEY (entity_id, media_id)
);

-- Đường dẫn từng tồn tại nhưng đã gỡ -> Atlas trả 410.
CREATE TABLE atlas.tombstones (
  path        text PRIMARY KEY,                         -- VD '/stories/hanh-trinh-10-nam'
  removed_at  timestamptz NOT NULL
);

-- =====================================================================
-- ROLE VÀ QUYỀN. Chạy bằng tài khoản owner của database.
-- Mật khẩu đặt khi chạy, không commit.
-- =====================================================================
-- CREATE ROLE nexture_app  LOGIN PASSWORD '<...>';
-- CREATE ROLE atlas_reader LOGIN PASSWORD '<...>';
GRANT USAGE ON SCHEMA core, atlas TO nexture_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core, atlas TO nexture_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA core  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nexture_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA atlas GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nexture_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA core TO nexture_app;

REVOKE ALL ON SCHEMA core FROM atlas_reader;
GRANT USAGE ON SCHEMA atlas TO atlas_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA atlas TO atlas_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA atlas GRANT SELECT ON TABLES TO atlas_reader;
-- Atlas cần chuẩn hóa từ khóa tìm kiếm nhưng KHÔNG được USAGE schema core,
-- nên có bản sao hàm trong schema atlas (logic giống hệt core.f_search_norm).
CREATE OR REPLACE FUNCTION atlas.f_search_norm(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE
  AS $$ SELECT lower(replace(replace(public.unaccent('public.unaccent'::regdictionary, coalesce($1,'')), 'đ', 'd'), 'Đ', 'D')) $$;
GRANT EXECUTE ON FUNCTION atlas.f_search_norm(text) TO atlas_reader;

-- Kiểm tra sau khi chạy (PHẢI trả lỗi permission denied):
--   SET ROLE atlas_reader; SELECT 1 FROM core.stories LIMIT 1;
