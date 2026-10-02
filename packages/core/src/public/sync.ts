// Projection core -> atlas, run inside the caller's transaction: docs/spec/08-cong-khai.md.
// Nothing else writes to schema atlas.
import { and, asc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import type { Tx } from '@nexture/db';
import { atlasTables as a, coreTables as t } from '@nexture/db';
import { EMPLOYEE_SIZES, EVENT_TYPE_LABELS, industryName, provinceName } from '@nexture/contracts';
import type { Storage } from '../storage';
import { makeSlug } from '../slug';
import { isOrgPublic, isPublic } from './rules';

export type PublicEntityType = 'EVENT';
export type SyncResult = { tags: Set<string>; deletePublicKeys: Set<string> };
export const emptySync = (): SyncResult => ({ tags: new Set(), deletePublicKeys: new Set() });

type OrgRow = typeof t.organizations.$inferSelect;
type EventRow = typeof t.events.$inferSelect;

export const ATLAS_PREFIX: Record<PublicEntityType, string> = { EVENT: '/events' };
export const atlasPath = (type: PublicEntityType, slug: string) => `${ATLAS_PREFIX[type]}/${slug}`;

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
async function linkedValueNames(tx: Tx, entityType: 'EVENT' | 'STORY', id: string) {
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
  if (!ids.length) return [];
  const rows = await tx
    .select({ name: t.cultureValues.nameVi })
    .from(t.cultureValues)
    .where(and(inArray(t.cultureValues.id, ids), eq(t.cultureValues.visibility, 'PUBLIC'), isNull(t.cultureValues.deletedAt)))
    .orderBy(asc(t.cultureValues.sortOrder));
  return rows.map((r) => r.name);
}

async function publicSources(tx: Tx, entityType: 'EVENT', id: string) {
  const rows = await tx
    .select({ title: t.entitySources.title, url: t.entitySources.url, note: t.entitySources.note })
    .from(t.entitySources)
    .where(and(eq(t.entitySources.entityType, entityType), eq(t.entitySources.entityId, id), eq(t.entitySources.isPublic, true), isNull(t.entitySources.deletedAt)))
    .orderBy(asc(t.entitySources.sortOrder));
  return rows.map((r) => ({ title: r.title, url: r.url ?? null, note: r.note ?? null }));
}

async function uniquePublicSlug(tx: Tx, e: EventRow, org: OrgRow) {
  const taken = async (s: string) => (await tx.select({ id: t.events.id }).from(t.events).where(eq(t.events.publicSlug, s))).length > 0;
  const base = makeSlug(e.titleVi);
  if (!(await taken(base))) return base;
  const withOrg = makeSlug(`${e.titleVi} ${org.slug}`);
  if (!(await taken(withOrg))) return withOrg;
  for (let i = 2; ; i++) if (!(await taken(`${withOrg}-${i}`))) return `${withOrg}-${i}`;
}

/** 08 §2 syncEntity for an Event. */
async function syncEvent(tx: Tx, storage: Storage | undefined, id: string, out: SyncResult) {
  const [e] = await tx.select().from(t.events).where(eq(t.events.id, id));
  if (!e) return;
  const org = await loadOrg(tx, e.organizationId);
  const [existing] = await tx.select({ id: a.entities.id, slug: a.entities.slug, publishedAt: a.entities.publishedAt }).from(a.entities).where(eq(a.entities.id, id));

  if (isPublic(e, org)) {
    await rebuildCompany(tx, storage, org, out);
    let slug = e.publicSlug;
    if (!slug) {
      slug = await uniquePublicSlug(tx, e, org);
      await tx.update(t.events).set({ publicSlug: slug }).where(eq(t.events.id, id));
    }
    const path = atlasPath('EVENT', slug);
    const subtitle = EVENT_TYPE_LABELS[e.eventType];
    const row = {
      id,
      entityType: 'EVENT' as const,
      slug,
      orgId: org.id,
      companySlug: org.slug,
      companyName: org.name,
      title: e.titleVi,
      subtitle,
      summary: e.summaryVi,
      bodyHtml: e.contentVi,
      extra: { values: await linkedValueNames(tx, 'EVENT', id), eventType: e.eventType },
      sortDate: e.startDate,
      datePrecision: e.startDatePrecision,
      endDate: e.endDate,
      endDatePrecision: e.endDatePrecision,
      coverUrl: null, // cover media sync arrives with the media library step
      coverAlt: null,
      sources: await publicSources(tx, 'EVENT', id),
      publishedAt: existing?.publishedAt ?? new Date(),
      updatedAt: new Date(),
      searchText: sql`atlas.f_search_norm(${[e.titleVi, subtitle, e.summaryVi ?? '', org.name].join(' ')})`,
    };
    await tx.insert(a.entities).values(row).onConflictDoUpdate({ target: a.entities.id, set: { ...row, id: undefined } });
    await tx.delete(a.tombstones).where(eq(a.tombstones.path, path));
    out.tags.add(`entity:${path}`);
  } else if (existing) {
    await tx.delete(a.entities).where(eq(a.entities.id, id));
    const path = atlasPath('EVENT', existing.slug);
    await tombstone(tx, path);
    out.tags.add(`entity:${path}`);
  } else {
    return;
  }
  await rebuildRelations(tx, org.id);
  await rebuildCompany(tx, storage, org, out);
  out.tags.add(`company:${org.slug}`).add('home').add('companies');
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
    .select({ name: t.cultureValues.nameVi, description: t.cultureValues.descriptionVi })
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
    featuredStorySlug: null, // stories arrive in a later step
    cultureValues: values,
    publicEntityCount: n,
    firstPublishedAt: org.atlasFirstEnabledAt ?? new Date(),
    updatedAt: new Date(),
    searchText: sql`atlas.f_search_norm(${[org.name, org.shortDescVi ?? ''].join(' ')})`,
  };
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
    for (const r of rows) await tombstone(tx, `${ATLAS_PREFIX[r.type as PublicEntityType]}/${r.slug}`);
    if (company) await tombstone(tx, `/companies/${org.slug}`);
    await tx.delete(a.entities).where(eq(a.entities.orgId, orgId));
    await tx.delete(a.companies).where(eq(a.companies.orgId, orgId));
    if (org.logoMediaId) {
      const [m] = await tx.select({ key: t.mediaAssets.publicStorageKey }).from(t.mediaAssets).where(eq(t.mediaAssets.id, org.logoMediaId));
      if (m?.key) {
        out.deletePublicKeys.add(m.key);
        await tx.update(t.mediaAssets).set({ publicStorageKey: null }).where(eq(t.mediaAssets.id, org.logoMediaId));
      }
    }
    return;
  }
  await rebuildCompany(tx, storage, org, out);
  const events = await tx.select({ id: t.events.id }).from(t.events).where(eq(t.events.organizationId, orgId));
  for (const e of events) await syncEvent(tx, storage, e.id, out);
}

export type SyncScope = { kind: 'entity'; type: PublicEntityType; id: string } | { kind: 'org'; orgId: string };

export async function syncPublic(tx: Tx, storage: Storage | undefined, scope: SyncScope, out: SyncResult = emptySync()): Promise<SyncResult> {
  if (scope.kind === 'org') await syncOrg(tx, storage, scope.orgId, out);
  else await syncEvent(tx, storage, scope.id, out);
  return out;
}
