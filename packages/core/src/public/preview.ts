// GET .../public-preview (06 §7.1, 05-api.yaml): what the Atlas page would show if the item were public now.
// Built from current data, also before verification; writes nothing.
import { and, asc, eq, inArray, or } from 'drizzle-orm';
import type { Tx } from '@nexture/db';
import { atlasTables as a, coreTables as t } from '@nexture/db';
import { canOrg } from '../authz';
import { requireMember, type Ctx } from '../context';
import { fail } from '../errors';
import { KINDS } from '../content/registry';
import { loadContent } from '../content/engine';
import { mediaRef } from '../media';
import { makeSlug } from '../slug';
import { atlasPath, atlasTypeOf, coverIdOf, isMediaPublic, project, publicSources, type PublicEntityType } from './sync';

export async function publicPreview(ctx: Ctx, collection: string, orgId: string, id: string) {
  const kind = KINDS[collection] ?? fail('NOT_FOUND');
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'content.create')) fail('FORBIDDEN');
  const type = kind.type as PublicEntityType;
  const e = await loadContent<Parameters<typeof coverIdOf>[1] & { publicSlug: string | null; status: string; kind?: 'PRODUCT' | 'PROJECT' }>(ctx.db, kind, role, orgId, id);
  const db = ctx.db as unknown as Tx;
  const [org] = await db.select().from(t.organizations).where(eq(t.organizations.id, orgId));
  const p = await project(db, type, e as never);
  const atlasType = atlasTypeOf(type, e);
  const warnings: string[] = [];
  if (e.status !== 'VERIFIED') warnings.push('Nội dung chưa được xác minh nên chưa thể công khai.');
  if (!org!.atlasEnabled) warnings.push('Hồ sơ doanh nghiệp chưa bật trên Atlas, nội dung sẽ chờ tới khi bật.');

  let cover: { url: string; alt: string } | null = null;
  const coverId = coverIdOf(type, e);
  if (coverId && ctx.storage) {
    const [m] = await db.select().from(t.mediaAssets).where(and(eq(t.mediaAssets.id, coverId), eq(t.mediaAssets.organizationId, orgId)));
    if (m && isMediaPublic(m) && m.kind === 'IMAGE') cover = { url: (await mediaRef(ctx, m)).url, alt: m.altText ?? m.title };
    else if (m) warnings.push('Ảnh bìa chưa được xác minh và công khai nên sẽ không hiện.');
  }

  const gallery: { id: string; url: string; kind: string; title: string; caption: string | null }[] = [];
  let hiddenMedia = 0;
  const rows = await db
    .select({ m: t.mediaAssets, caption: t.entityMedia.caption })
    .from(t.entityMedia)
    .innerJoin(t.mediaAssets, eq(t.mediaAssets.id, t.entityMedia.mediaId))
    .where(and(eq(t.entityMedia.entityType, type), eq(t.entityMedia.entityId, id)))
    .orderBy(asc(t.entityMedia.sortOrder));
  for (const r of rows) {
    if (!isMediaPublic(r.m) || !ctx.storage) hiddenMedia++;
    else gallery.push({ id: r.m.id, url: (await mediaRef(ctx, r.m)).url, kind: r.m.kind, title: r.m.title, caption: r.caption });
  }
  if (hiddenMedia) warnings.push(`${hiddenMedia} ảnh/video chưa được xác minh và công khai nên sẽ không hiện.`);

  // Only related items already live on Atlas are linked (05-api.yaml).
  const links = await db
    .select({ s: t.relationships.sourceId, t: t.relationships.targetId })
    .from(t.relationships)
    .where(and(eq(t.relationships.organizationId, orgId), or(eq(t.relationships.sourceId, id), eq(t.relationships.targetId, id))));
  const otherIds = [...new Set(links.map((l) => (l.s === id ? l.t : l.s)))];
  const related = otherIds.length
    ? await db
        .select({ id: a.entities.id, entityType: a.entities.entityType, title: a.entities.title, subtitle: a.entities.subtitle, coverUrl: a.entities.coverUrl })
        .from(a.entities)
        .where(inArray(a.entities.id, otherIds))
        .orderBy(asc(a.entities.title))
    : [];

  const [{ logoUrl } = { logoUrl: null }] = await db.select({ logoUrl: a.companies.logoUrl }).from(a.companies).where(eq(a.companies.orgId, orgId));
  const base = (ctx.atlas?.baseUrl ?? process.env.ATLAS_BASE_URL ?? 'https://atlas').replace(/\/$/, '');
  return {
    url: `${base}${atlasPath(atlasType, e.publicSlug ?? makeSlug(p.title))}`,
    path: atlasPath(atlasType, e.publicSlug ?? makeSlug(p.title)),
    entityType: atlasType,
    companyName: org!.name,
    companyLogoUrl: logoUrl,
    companyShortDesc: org!.shortDescVi,
    ...p,
    cover,
    gallery,
    related,
    sources: await publicSources(db, type, id),
    warnings,
  };
}
