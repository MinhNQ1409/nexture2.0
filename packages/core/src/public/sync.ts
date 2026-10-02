// Projection core -> atlas, run inside the caller's transaction: docs/spec/08-cong-khai.md.
// Nothing else writes to schema atlas.
import { and, asc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import type { Tx } from '@nexture/db';
import { atlasTables as a, coreTables as t } from '@nexture/db';
import type { EntityEn } from '@nexture/db/atlas';
import { EMPLOYEE_SIZES, EVENT_TYPE_LABELS, EVENT_TYPE_LABELS_EN, PP_KIND_LABELS, PP_KIND_LABELS_EN, STORY_TYPE_LABELS, STORY_TYPE_LABELS_EN, industryName, industryNameEn, provinceName, provinceNameEn } from '@nexture/contracts';
import type { Storage } from '../storage';
import { makeSlug } from '../slug';
import { isOrgPublic, isPublic } from './rules';

export type PublicEntityType = 'STORY' | 'EVENT' | 'PERSON' | 'PRODUCT_PROJECT';
/** atlas.entities.entity_type: products and projects are separate on Atlas (08 §3). */
export type AtlasEntityType = 'STORY' | 'EVENT' | 'PERSON' | 'PRODUCT' | 'PROJECT';
export type SyncResult = { tags: Set<string>; deletePublicKeys: Set<string> };
export const emptySync = (): SyncResult => ({ tags: new Set(), deletePublicKeys: new Set() });

type OrgRow = typeof t.organizations.$inferSelect;
type StoryRow = typeof t.stories.$inferSelect;
type EventRow = typeof t.events.$inferSelect;
type PersonRow = typeof t.people.$inferSelect;
type ProductRow = typeof t.productsProjects.$inferSelect;
type AnyRow = StoryRow | EventRow | PersonRow | ProductRow;
/** Shared workflow columns, typed through the events table. */
type Tbl = typeof t.events;

const TABLES: Record<PublicEntityType, unknown> = { STORY: t.stories, EVENT: t.events, PERSON: t.people, PRODUCT_PROJECT: t.productsProjects };
const tbl = (type: PublicEntityType) => TABLES[type] as Tbl;

export const ATLAS_PREFIX: Record<AtlasEntityType, string> = { STORY: '/stories', EVENT: '/events', PERSON: '/people', PRODUCT: '/products', PROJECT: '/projects' };
export const atlasPath = (type: AtlasEntityType, slug: string) => `${ATLAS_PREFIX[type]}/${slug}`;
export const atlasTypeOf = (type: PublicEntityType, row: { kind?: 'PRODUCT' | 'PROJECT' }): AtlasEntityType =>
  type === 'PRODUCT_PROJECT' ? (row.kind ?? 'PRODUCT') : type;

async function loadOrg(tx: Tx, orgId: string) {
  const [org] = await tx.select().from(t.organizations).where(eq(t.organizations.id, orgId));
  if (!org) throw new Error(`org ${orgId} not found`);
  return org;
}

async function tombstone(tx: Tx, path: string) {
  await tx
    .insert(a.tombstones)
    .values({ path, removedAt: new Date() })
    .onConflictDoUpdate({ target: a.tombstones.path, set: { removedAt: new Date() } });
}

/** Public names of culture values linked to an entity (08 §6). */
async function linkedValueNames(tx: Tx, entityType: 'EVENT' | 'STORY', id: string): Promise<{ vi: string[]; en: string[] }> {
  const rels = await tx
    .select({ s: t.relationships.sourceId, st: t.relationships.sourceType, tg: t.relationships.targetId })
    .from(t.relationships)
    .where(
      or(
        and(eq(t.relationships.sourceType, entityType), eq(t.relationships.sourceId, id), eq(t.relationships.targetType, 'CULTURE_VALUE')),
        and(eq(t.relationships.targetType, entityType), eq(t.relationships.targetId, id), eq(t.relationships.sourceType, 'CULTURE_VALUE')),
      ),
    );
  const ids = rels.map((r) => (r.st === 'CULTURE_VALUE' ? r.s : r.tg));
  if (!ids.length) return { vi: [], en: [] };
  const rows = await tx
    .select({ name: t.cultureValues.nameVi, nameEn: t.cultureValues.nameEn })
    .from(t.cultureValues)
    .where(and(inArray(t.cultureValues.id, ids), eq(t.cultureValues.visibility, 'PUBLIC'), isNull(t.cultureValues.deletedAt)))
    .orderBy(asc(t.cultureValues.sortOrder));
  return { vi: rows.map((r) => r.name), en: rows.map((r) => r.nameEn ?? r.name) };
}

export async function publicSources(tx: Tx, entityType: PublicEntityType, id: string) {
  const rows = await tx
    .select({ title: t.entitySources.title, url: t.entitySources.url, note: t.entitySources.note })
    .from(t.entitySources)
    .where(and(eq(t.entitySources.entityType, entityType), eq(t.entitySources.entityId, id), eq(t.entitySources.isPublic, true), isNull(t.entitySources.deletedAt)))
    .orderBy(asc(t.entitySources.sortOrder));
  return rows.map((r) => ({ title: r.title, url: r.url ?? null, note: r.note ?? null }));
}

async function uniquePublicSlug(tx: Tx, type: PublicEntityType, title: string, org: OrgRow) {
  const x = tbl(type);
  const taken = async (s: string) => (await tx.select({ id: x.id }).from(x).where(eq(x.publicSlug, s))).length > 0;
  const base = makeSlug(title);
  if (!(await taken(base))) return base;
  const withOrg = makeSlug(`${title} ${org.slug}`);
  if (!(await taken(withOrg))) return withOrg;
  for (let i = 2; ; i++) if (!(await taken(`${withOrg}-${i}`))) return `${withOrg}-${i}`;
}

type Projection = {
  title: string;
  subtitle: string | null;
  summary: string | null;
  bodyHtml: string | null;
  extra: Record<string, unknown>;
  sortDate: string | null;
  datePrecision: string | null;
  endDate: string | null;
  endDatePrecision: string | null;
  en: EntityEn;
};

/** Drops empty English fields so Atlas falls back to Vietnamese per field. */
const compact = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== '')) as { [K in keyof T]?: NonNullable<T[K]> };

/** 08 §3 whitelist, per type. */
export async function project(tx: Tx, type: PublicEntityType, row: AnyRow): Promise<Projection> {
  switch (type) {
    case 'STORY': {
      const s = row as StoryRow;
      const values = await linkedValueNames(tx, 'STORY', s.id);
      return {
        title: s.titleVi,
        subtitle: STORY_TYPE_LABELS[s.storyType],
        summary: s.summaryVi,
        bodyHtml: s.contentVi,
        extra: { values: values.vi },
        en: compact({ title: s.titleEn, subtitle: STORY_TYPE_LABELS_EN[s.storyType], summary: s.summaryEn, bodyHtml: s.contentEn, extra: { values: values.en } }),
        sortDate: s.storyDate,
        datePrecision: s.storyDatePrecision,
        endDate: null,
        endDatePrecision: null,
      };
    }
    case 'EVENT': {
      const e = row as EventRow;
      const values = await linkedValueNames(tx, 'EVENT', e.id);
      return {
        title: e.titleVi,
        subtitle: EVENT_TYPE_LABELS[e.eventType],
        summary: e.summaryVi,
        bodyHtml: e.contentVi,
        extra: { values: values.vi, eventType: e.eventType },
        en: compact({ title: e.titleEn, subtitle: EVENT_TYPE_LABELS_EN[e.eventType], summary: e.summaryEn, bodyHtml: e.contentEn, extra: { values: values.en, eventType: e.eventType } }),
        sortDate: e.startDate,
        datePrecision: e.startDatePrecision,
        endDate: e.endDate,
        endDatePrecision: e.endDatePrecision,
      };
    }
    case 'PERSON': {
      const p = row as PersonRow;
      return {
        title: p.fullName,
        subtitle: p.roleTitleVi,
        summary: null,
        bodyHtml: p.bioVi,
        extra: { isFounder: p.isFounder, contributionsHtml: p.contributionsVi },
        en: compact({ subtitle: p.roleTitleEn, bodyHtml: p.bioEn, extra: { isFounder: p.isFounder, contributionsHtml: p.contributionsEn ?? p.contributionsVi } }),
        sortDate: p.joinedDate,
        datePrecision: p.joinedDatePrecision,
        endDate: p.leftDate,
        endDatePrecision: p.leftDatePrecision,
      };
    }
    case 'PRODUCT_PROJECT': {
      const p = row as ProductRow;
      return {
        title: p.titleVi,
        subtitle: PP_KIND_LABELS[p.kind],
        summary: p.summaryVi,
        bodyHtml: p.descriptionVi,
        extra: { status: p.ppStatus },
        en: compact({ title: p.titleEn, subtitle: PP_KIND_LABELS_EN[p.kind], summary: p.summaryEn, bodyHtml: p.descriptionEn }),
        sortDate: p.launchDate,
        datePrecision: p.launchDatePrecision,
        endDate: null,
        endDatePrecision: null,
      };
    }
  }
}

/** 08 §2 syncEntity. */
async function syncEntity(tx: Tx, storage: Storage | undefined, type: PublicEntityType, id: string, out: SyncResult) {
  const x = tbl(type);
  const [e] = (await tx.select().from(x).where(eq(x.id, id))) as AnyRow[];
  if (!e) return;
  const org = await loadOrg(tx, e.organizationId);
  const [existing] = await tx
    .select({ id: a.entities.id, type: a.entities.entityType, slug: a.entities.slug, publishedAt: a.entities.publishedAt })
    .from(a.entities)
    .where(eq(a.entities.id, id));
  const atlasType = atlasTypeOf(type, e as { kind?: 'PRODUCT' | 'PROJECT' });

  if (isPublic(e, org)) {
    await rebuildCompany(tx, storage, org, out);
    const p = await project(tx, type, e);
    let slug = e.publicSlug;
    if (!slug) {
      slug = await uniquePublicSlug(tx, type, p.title, org);
      await tx.update(x).set({ publicSlug: slug }).where(eq(x.id, id));
    }
    const path = atlasPath(atlasType, slug);
    const row = {
      id,
      entityType: atlasType,
      slug,
      orgId: org.id,
      companySlug: org.slug,
      companyName: org.name,
      ...p,
      ...(await publicCover(tx, storage, org, coverIdOf(type, e))),
      sources: await publicSources(tx, type, id),
      publishedAt: existing?.publishedAt ?? new Date(),
      updatedAt: new Date(),
      searchText: sql`atlas.f_search_norm(${[p.title, p.subtitle ?? '', p.summary ?? '', org.name, p.en.title ?? ''].join(' ')})`,
    };
    await tx.insert(a.entities).values(row).onConflictDoUpdate({ target: a.entities.id, set: { ...row, id: undefined } });
    await syncGallery(tx, storage, org, type, id);
    await tx.delete(a.tombstones).where(eq(a.tombstones.path, path));
    out.tags.add(`entity:${path}`);
    // Product <-> project switch: the old path redirects (308), it is not a tombstone (08 §5).
    if (existing && existing.type !== atlasType) out.tags.add(`entity:${atlasPath(existing.type as AtlasEntityType, existing.slug)}`);
  } else if (existing) {
    await tx.delete(a.entities).where(eq(a.entities.id, id));
    const path = atlasPath(existing.type as AtlasEntityType, existing.slug);
    await tombstone(tx, path);
    out.tags.add(`entity:${path}`);
  } else {
    return;
  }
  await rebuildRelations(tx, org.id);
  await rebuildCompany(tx, storage, org, out);
  await cleanupMedia(tx, org, out);
  out.tags.add(`company:${org.slug}`).add('home').add('companies');
}

// ---------------------------------------------------------------- media (08 §4)
type MediaRow = typeof t.mediaAssets.$inferSelect;
export const coverIdOf = (type: PublicEntityType, row: AnyRow): string | null =>
  type === 'PERSON' ? (row as PersonRow).avatarMediaId : (row as StoryRow | EventRow | ProductRow).coverMediaId;

/** 08 §4: eligible to be public. */
export const isMediaPublic = (m: Pick<MediaRow, 'deletedAt' | 'uploadStatus' | 'status' | 'visibility' | 'kind'>) =>
  m.deletedAt === null && m.uploadStatus === 'READY' && m.status === 'VERIFIED' && m.visibility === 'PUBLIC' && (m.kind === 'IMAGE' || m.kind === 'VIDEO');

/** Copies to the public bucket on first use (before commit) and upserts atlas.media; returns the public URL. */
async function publishMedia(tx: Tx, storage: Storage, orgId: string, m: MediaRow): Promise<string> {
  let key = m.publicStorageKey;
  if (!key) {
    key = `public/${m.id}/${m.storageKey.split('/').pop()}`;
    await storage.copyToPublic(m.storageKey, key);
    await tx.update(t.mediaAssets).set({ publicStorageKey: key }).where(eq(t.mediaAssets.id, m.id));
  }
  const url = storage.publicUrl(key);
  const row = { id: m.id, orgId, kind: m.kind as 'IMAGE' | 'VIDEO', url, mimeType: m.mimeType, width: m.width, height: m.height, alt: m.altText, title: m.title };
  await tx.insert(a.media).values(row).onConflictDoUpdate({ target: a.media.id, set: { ...row, id: undefined } });
  return url;
}

async function publicCover(tx: Tx, storage: Storage | undefined, org: OrgRow, mediaId: string | null) {
  if (!mediaId || !storage) return { coverUrl: null, coverAlt: null };
  const [m] = await tx.select().from(t.mediaAssets).where(and(eq(t.mediaAssets.id, mediaId), eq(t.mediaAssets.organizationId, org.id)));
  if (!m || !isMediaPublic(m) || m.kind !== 'IMAGE') return { coverUrl: null, coverAlt: null };
  return { coverUrl: await publishMedia(tx, storage, org.id, m), coverAlt: m.altText ?? m.title };
}

async function syncGallery(tx: Tx, storage: Storage | undefined, org: OrgRow, type: PublicEntityType, id: string) {
  await tx.delete(a.entityMedia).where(eq(a.entityMedia.entityId, id));
  if (!storage) return;
  const rows = await tx
    .select({ m: t.mediaAssets, sortOrder: t.entityMedia.sortOrder, caption: t.entityMedia.caption })
    .from(t.entityMedia)
    .innerJoin(t.mediaAssets, eq(t.mediaAssets.id, t.entityMedia.mediaId))
    .where(and(eq(t.entityMedia.entityType, type), eq(t.entityMedia.entityId, id)))
    .orderBy(asc(t.entityMedia.sortOrder));
  for (const r of rows) {
    if (!isMediaPublic(r.m)) continue;
    await publishMedia(tx, storage, org.id, r.m);
    await tx.insert(a.entityMedia).values({ entityId: id, mediaId: r.m.id, sortOrder: r.sortOrder, caption: r.caption });
  }
}

/** Media no longer used by any public item of the org leaves Atlas; files are deleted after commit. */
async function cleanupMedia(tx: Tx, org: OrgRow, out: SyncResult) {
  const used = new Set<string>();
  const live = await tx.select({ id: a.entities.id, type: a.entities.entityType }).from(a.entities).where(eq(a.entities.orgId, org.id));
  const liveIds = live.map((r) => r.id);
  if (liveIds.length) {
    for (const type of Object.keys(TABLES) as PublicEntityType[]) {
      const x = tbl(type);
      const rows = (await tx.select().from(x).where(inArray(x.id, liveIds))) as AnyRow[];
      for (const r of rows) {
        const c = coverIdOf(type, r);
        if (c) used.add(c);
      }
    }
    const gal = await tx.select({ id: a.entityMedia.mediaId }).from(a.entityMedia).where(inArray(a.entityMedia.entityId, liveIds));
    for (const g of gal) used.add(g.id);
  }
  const published = await tx
    .select({ id: t.mediaAssets.id, key: t.mediaAssets.publicStorageKey, m: t.mediaAssets })
    .from(t.mediaAssets)
    .where(and(eq(t.mediaAssets.organizationId, org.id), sql`${t.mediaAssets.publicStorageKey} IS NOT NULL`));
  for (const p of published) {
    if (p.id === org.logoMediaId) continue;
    if (used.has(p.id) && isMediaPublic(p.m)) continue;
    await tx.delete(a.media).where(eq(a.media.id, p.id));
    out.deletePublicKeys.add(p.key!);
    await tx.update(t.mediaAssets).set({ publicStorageKey: null }).where(eq(t.mediaAssets.id, p.id));
  }
  // atlas.media rows of covers that never had a gallery row
  const rows = await tx.select({ id: a.media.id }).from(a.media).where(eq(a.media.orgId, org.id));
  for (const r of rows) if (!used.has(r.id)) await tx.delete(a.media).where(eq(a.media.id, r.id));
}

/** 08 §6. */
async function rebuildRelations(tx: Tx, orgId: string) {
  await tx.execute(sql`
    DELETE FROM atlas.relations WHERE from_id IN (SELECT id FROM atlas.entities WHERE org_id = ${orgId});
  `);
  await tx.execute(sql`
    INSERT INTO atlas.relations(from_id, to_id)
    SELECT r.source_id, r.target_id FROM core.relationships r
     WHERE r.organization_id = ${orgId}
       AND r.source_id IN (SELECT id FROM atlas.entities WHERE org_id = ${orgId})
       AND r.target_id IN (SELECT id FROM atlas.entities WHERE org_id = ${orgId})
    UNION
    SELECT r.target_id, r.source_id FROM core.relationships r
     WHERE r.organization_id = ${orgId}
       AND r.source_id IN (SELECT id FROM atlas.entities WHERE org_id = ${orgId})
       AND r.target_id IN (SELECT id FROM atlas.entities WHERE org_id = ${orgId})
    ON CONFLICT DO NOTHING
  `);
}

/** Copies the logo to the public bucket on first use and returns its public URL (08 §4: logo needs only READY). */
async function publicLogoUrl(tx: Tx, storage: Storage | undefined, org: OrgRow) {
  if (!org.logoMediaId || !storage) return null;
  const [m] = await tx
    .select()
    .from(t.mediaAssets)
    .where(and(eq(t.mediaAssets.id, org.logoMediaId), eq(t.mediaAssets.uploadStatus, 'READY'), eq(t.mediaAssets.kind, 'IMAGE'), isNull(t.mediaAssets.deletedAt)));
  if (!m) return null;
  let key = m.publicStorageKey;
  if (!key) {
    key = `public/${m.id}/${m.storageKey.split('/').pop()}`;
    await storage.copyToPublic(m.storageKey, key); // copy before commit (08 §4)
    await tx.update(t.mediaAssets).set({ publicStorageKey: key }).where(eq(t.mediaAssets.id, m.id));
  }
  return storage.publicUrl(key);
}

/** 08 §7. No-op when the org is not public. */
async function rebuildCompany(tx: Tx, storage: Storage | undefined, org: OrgRow, out: SyncResult) {
  if (!isOrgPublic(org)) return;
  const values = await tx
    .select({ name: t.cultureValues.nameVi, description: t.cultureValues.descriptionVi, nameEn: t.cultureValues.nameEn, descriptionEn: t.cultureValues.descriptionEn })
    .from(t.cultureValues)
    .where(and(eq(t.cultureValues.organizationId, org.id), eq(t.cultureValues.visibility, 'PUBLIC'), isNull(t.cultureValues.deletedAt)))
    .orderBy(asc(t.cultureValues.sortOrder));
  const [{ n } = { n: 0 }] = await tx.select({ n: sql<number>`count(*)::int` }).from(a.entities).where(eq(a.entities.orgId, org.id));
  const row = {
    orgId: org.id,
    slug: org.slug,
    name: org.name,
    logoUrl: await publicLogoUrl(tx, storage, org),
    foundedYear: org.foundedYear,
    industryCode: org.industryCode,
    industryName: org.industryCode ? industryName(org.industryCode) : null,
    employeeSize: org.employeeSize ? (EMPLOYEE_SIZES.find((s) => s.code === org.employeeSize)?.name ?? null) : null,
    provinceCode: org.provinceCode,
    provinceName: org.provinceCode ? provinceName(org.provinceCode) : null,
    website: org.website,
    shortDesc: org.shortDescVi,
    featuredStorySlug: org.featuredStoryId
      ? ((await tx.select({ slug: a.entities.slug }).from(a.entities).where(and(eq(a.entities.id, org.featuredStoryId), eq(a.entities.entityType, 'STORY'))))[0]?.slug ?? null)
      : null,
    cultureValues: values.map((v) => ({ name: v.name, description: v.description })),
    en: compact({
      shortDesc: org.shortDescEn,
      cultureValues: values.map((v) => ({ name: v.nameEn ?? v.name, description: v.descriptionEn ?? v.description })),
      industryName: industryNameEn(org.industryCode),
      provinceName: provinceNameEn(org.provinceCode),
    }),
    publicEntityCount: n,
    firstPublishedAt: org.atlasFirstEnabledAt ?? new Date(),
    updatedAt: new Date(),
    searchText: sql`''`,
  };
  // 02-database.sql: name + short desc + industry + province.
  row.searchText = sql`atlas.f_search_norm(${[org.name, org.shortDescVi ?? '', row.industryName ?? '', row.provinceName ?? ''].join(' ')})`;
  await tx.insert(a.companies).values(row).onConflictDoUpdate({ target: a.companies.orgId, set: { ...row, orgId: undefined } });
  await tx.delete(a.tombstones).where(eq(a.tombstones.path, `/companies/${org.slug}`));
  out.tags.add(`company:${org.slug}`).add('home').add('companies');
}

/** 08 §2 syncOrg. */
async function syncOrg(tx: Tx, storage: Storage | undefined, orgId: string, out: SyncResult) {
  const org = await loadOrg(tx, orgId);
  out.tags.add(`company:${org.slug}`).add('home').add('companies');
  if (!isOrgPublic(org)) {
    const [company] = await tx.select({ orgId: a.companies.orgId }).from(a.companies).where(eq(a.companies.orgId, orgId));
    const rows = await tx.select({ type: a.entities.entityType, slug: a.entities.slug }).from(a.entities).where(eq(a.entities.orgId, orgId));
    for (const r of rows) await tombstone(tx, atlasPath(r.type as AtlasEntityType, r.slug));
    if (company) await tombstone(tx, `/companies/${org.slug}`);
    await tx.delete(a.entities).where(eq(a.entities.orgId, orgId));
    await tx.delete(a.companies).where(eq(a.companies.orgId, orgId));
    await tx.delete(a.media).where(eq(a.media.orgId, orgId));
    const keys = await tx
      .select({ id: t.mediaAssets.id, key: t.mediaAssets.publicStorageKey })
      .from(t.mediaAssets)
      .where(and(eq(t.mediaAssets.organizationId, orgId), sql`${t.mediaAssets.publicStorageKey} IS NOT NULL`));
    for (const k of keys) {
      out.deletePublicKeys.add(k.key!);
      await tx.update(t.mediaAssets).set({ publicStorageKey: null }).where(eq(t.mediaAssets.id, k.id));
    }
    return;
  }
  await rebuildCompany(tx, storage, org, out);
  for (const type of Object.keys(TABLES) as PublicEntityType[]) {
    const x = tbl(type);
    const rows = await tx.select({ id: x.id }).from(x).where(eq(x.organizationId, orgId));
    for (const r of rows) await syncEntity(tx, storage, type, r.id, out);
  }
}

export type SyncScope = { kind: 'entity'; type: PublicEntityType; id: string } | { kind: 'org'; orgId: string };

export async function syncPublic(tx: Tx, storage: Storage | undefined, scope: SyncScope, out: SyncResult = emptySync()): Promise<SyncResult> {
  if (scope.kind === 'org') await syncOrg(tx, storage, scope.orgId, out);
  else await syncEntity(tx, storage, scope.type, scope.id, out);
  return out;
}
