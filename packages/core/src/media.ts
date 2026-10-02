// Media upload (3 steps): docs/spec/05-api-ghi-chu.md §5, 02-database-ghi-chu.md §7.
import { and, asc, count, desc, eq, inArray, isNull, ne, sql, type SQL } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import type { Tx } from '@nexture/db';
import { atlasTables as atlasT, coreTables as t } from '@nexture/db';
import { completeUploadInput, entityMediaInput, mediaPatch, MEDIA_RULES, uploadUrlInput, versionOnly, visibilityInput, type MediaKind, type OrgRole } from '@nexture/contracts';
import { diff, logActivity } from './activity';
import { canOrg, entityPermissions } from './authz';
import { requireMember, requireStorage, type Ctx } from './context';
import { fail } from './errors';
import { yearConds } from './filters';
import { makeSlug } from './slug';
import { parse } from './validate';
import { flushRevalidate } from './public/flush';
import { isOrgPublic } from './public/rules';
import { emptySync, isMediaPublic, syncPublic } from './public/sync';

function kindOf(mimeType: string, filename: string): MediaKind {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  for (const [kind, rule] of Object.entries(MEDIA_RULES) as [MediaKind, (typeof MEDIA_RULES)[MediaKind]][]) {
    if ((rule.mimes as readonly string[]).includes(mimeType) && (rule.exts as readonly string[]).includes(ext)) return kind;
  }
  return fail('FILE_TYPE_NOT_ALLOWED');
}

export async function createUploadUrl(ctx: Ctx, orgId: string, raw: unknown) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'media.upload')) fail('FORBIDDEN');
  const input = parse(uploadUrlInput, raw);
  const kind = kindOf(input.mimeType, input.filename);
  if (input.sizeBytes > MEDIA_RULES[kind].maxBytes) fail('FILE_TOO_LARGE', { maxBytes: MEDIA_RULES[kind].maxBytes });
  const id = uuidv7();
  const dot = input.filename.lastIndexOf('.');
  const base = dot > 0 ? input.filename.slice(0, dot) : input.filename;
  const ext = input.filename.slice(dot + 1).toLowerCase();
  const storageKey = `orgs/${orgId}/media/${id}/${makeSlug(base)}.${ext}`;
  await ctx.db.insert(t.mediaAssets).values({
    id,
    organizationId: orgId,
    kind,
    title: base.slice(0, 200) || 'Tư liệu',
    originalFilename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    storageKey,
    createdBy: ctx.actor.userId,
    updatedBy: ctx.actor.userId,
  });
  const put = await requireStorage(ctx).presignPut(storageKey, input.mimeType);
  return { mediaId: id, uploadUrl: put.url, headers: put.headers };
}

export async function completeUpload(ctx: Ctx, orgId: string, mediaId: string, raw: unknown) {
  await requireMember(ctx.db, ctx.actor, orgId);
  const input = parse(completeUploadInput, raw);
  const [m] = await ctx.db
    .select()
    .from(t.mediaAssets)
    .where(and(eq(t.mediaAssets.id, mediaId), eq(t.mediaAssets.organizationId, orgId), isNull(t.mediaAssets.deletedAt)));
  if (!m || m.createdBy !== ctx.actor.userId) return fail('NOT_FOUND');
  if (m.uploadStatus === 'READY') return mediaRef(ctx, m);
  const head = await requireStorage(ctx).head(m.storageKey);
  if (!head || head.size !== m.sizeBytes) fail('UPLOAD_MISMATCH');
  const [updated] = await ctx.db
    .update(t.mediaAssets)
    .set({
      uploadStatus: 'READY',
      ...(input.title ? { title: input.title } : {}),
      description: input.description,
      altText: input.altText,
      width: input.width ?? null,
      height: input.height ?? null,
      updatedAt: new Date(),
    })
    .where(eq(t.mediaAssets.id, mediaId))
    .returning();
  await logActivity(ctx.db, { organizationId: orgId, actorId: ctx.actor.userId, action: 'MEDIA_UPLOADED', targetType: 'MEDIA', targetId: mediaId, targetLabel: updated!.title });
  return mediaRef(ctx, updated!);
}

type MediaRow = typeof t.mediaAssets.$inferSelect;
export async function mediaRef(ctx: Ctx, m: MediaRow) {
  return {
    id: m.id,
    title: m.title,
    kind: m.kind,
    mimeType: m.mimeType,
    url: await requireStorage(ctx).presignGet(m.storageKey),
    width: m.width,
    height: m.height,
    altText: m.altText,
  };
}

/** MediaRef for an id when it is a READY asset of the org, otherwise null. */
export async function mediaRefById(ctx: Ctx, orgId: string, id: string | null) {
  if (!id || !ctx.storage) return null;
  const [m] = await ctx.db
    .select()
    .from(t.mediaAssets)
    .where(and(eq(t.mediaAssets.id, id), eq(t.mediaAssets.organizationId, orgId), eq(t.mediaAssets.uploadStatus, 'READY'), isNull(t.mediaAssets.deletedAt)));
  return m ? mediaRef(ctx, m) : null;
}

// ---------------------------------------------------------------- library (06 §10)

const visibleMedia = (role: OrgRole): SQL | undefined =>
  role === 'VIEWER' ? and(eq(t.mediaAssets.status, 'VERIFIED'), ne(t.mediaAssets.visibility, 'PRIVATE')) : undefined;

export type MediaListQuery = { q?: string; kind?: string; status?: string; visibility?: string; yearFrom?: string; yearTo?: string; page?: string | number; pageSize?: string | number };

export async function listMedia(ctx: Ctx, orgId: string, query: MediaListQuery = {}) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 48));
  const conds: (SQL | undefined)[] = [eq(t.mediaAssets.organizationId, orgId), isNull(t.mediaAssets.deletedAt), eq(t.mediaAssets.uploadStatus, 'READY'), visibleMedia(role)];
  const kinds = (query.kind ?? '').split(',').filter((k) => ['IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO'].includes(k)) as MediaRow['kind'][];
  if (kinds.length) conds.push(inArray(t.mediaAssets.kind, kinds));
  if (query.status) conds.push(eq(t.mediaAssets.status, query.status as MediaRow['status']));
  if (query.visibility) conds.push(eq(t.mediaAssets.visibility, query.visibility as MediaRow['visibility']));
  conds.push(...yearConds(t.mediaAssets.occurredDate, query.yearFrom, query.yearTo));
  const q = query.q?.trim();
  if (q && q.length >= 2) conds.push(sql`core.f_search_norm(${t.mediaAssets.title} || ' ' || array_to_string(${t.mediaAssets.tags}, ' ')) LIKE '%' || core.f_search_norm(${q}) || '%'`);
  const where = and(...conds);
  const [{ total } = { total: 0 }] = await ctx.db.select({ total: count() }).from(t.mediaAssets).where(where);
  const rows = await ctx.db.select().from(t.mediaAssets).where(where).orderBy(desc(t.mediaAssets.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
  return {
    page,
    pageSize,
    total,
    items: await Promise.all(
      rows.map(async (m) => ({ ...(await mediaRef(ctx, m)), sizeBytes: m.sizeBytes, status: m.status, visibility: m.visibility, createdAt: m.createdAt })),
    ),
  };
}

async function loadMedia(db: Ctx['db'] | Tx, role: OrgRole, orgId: string, id: string, forUpdate = false) {
  const q = db
    .select()
    .from(t.mediaAssets)
    .where(and(eq(t.mediaAssets.id, id), eq(t.mediaAssets.organizationId, orgId), isNull(t.mediaAssets.deletedAt), visibleMedia(role)));
  const [m] = forUpdate ? await q.for('update') : await q;
  if (!m) return fail('NOT_FOUND');
  return m;
}

/** Content items that use this media as cover/avatar or in their gallery. */
async function usedIn(db: Ctx['db'] | Tx, orgId: string, id: string) {
  const out: { type: string; id: string; title: string; how: 'COVER' | 'GALLERY' | 'LOGO' }[] = [];
  const [org] = await db.select({ logo: t.organizations.logoMediaId, name: t.organizations.name }).from(t.organizations).where(eq(t.organizations.id, orgId));
  if (org?.logo === id) out.push({ type: 'ORGANIZATION', id: orgId, title: org.name, how: 'LOGO' });
  const covers: [string, unknown, unknown, unknown][] = [
    ['STORY', t.stories, t.stories.coverMediaId, t.stories.titleVi],
    ['EVENT', t.events, t.events.coverMediaId, t.events.titleVi],
    ['PERSON', t.people, t.people.avatarMediaId, t.people.fullName],
    ['PRODUCT_PROJECT', t.productsProjects, t.productsProjects.coverMediaId, t.productsProjects.titleVi],
  ];
  for (const [type, tbl, col, title] of covers) {
    const x = tbl as typeof t.events;
    const rows = await db
      .select({ id: x.id, title: title as typeof t.events.titleVi })
      .from(x)
      .where(and(eq(col as typeof t.events.coverMediaId, id), isNull(x.deletedAt)));
    for (const r of rows) out.push({ type, id: r.id, title: r.title, how: 'COVER' });
  }
  const gal = await db.select({ type: t.entityMedia.entityType, id: t.entityMedia.entityId }).from(t.entityMedia).where(eq(t.entityMedia.mediaId, id));
  for (const g of gal) {
    const x = ({ STORY: t.stories, EVENT: t.events, PERSON: t.people, PRODUCT_PROJECT: t.productsProjects } as Record<string, unknown>)[g.type] as typeof t.events;
    if (!x) continue;
    const titleCol = g.type === 'PERSON' ? t.people.fullName : x.titleVi;
    const [r] = await db.select({ title: titleCol }).from(x).where(and(eq(x.id, g.id), isNull(x.deletedAt)));
    if (r) out.push({ type: g.type, id: g.id, title: r.title, how: 'GALLERY' });
  }
  return out;
}

async function mediaPublicState(db: Ctx['db'] | Tx, m: MediaRow) {
  if (m.status !== 'VERIFIED' || m.visibility !== 'PUBLIC') return 'NOT_PUBLIC' as const;
  const [org] = await db.select().from(t.organizations).where(eq(t.organizations.id, m.organizationId));
  if (org!.atlasHiddenAt) return 'HIDDEN_BY_NEXTURE' as const;
  if (!org!.atlasEnabled) return 'WAITING_ORG' as const;
  const [live] = await db.select({ id: atlasT.media.id }).from(atlasT.media).where(eq(atlasT.media.id, m.id));
  return live ? ('LIVE' as const) : ('NOT_USED' as const);
}

export async function mediaDto(ctx: Ctx, m: MediaRow, role: OrgRole) {
  return {
    ...(await mediaRef(ctx, m)),
    description: m.description,
    originalFilename: m.originalFilename,
    sizeBytes: m.sizeBytes,
    occurredDate: m.occurredDate && m.occurredDatePrecision ? { date: m.occurredDate, precision: m.occurredDatePrecision } : null,
    sourceNote: m.sourceNote,
    providedBy: m.providedBy,
    tags: m.tags,
    status: m.status,
    visibility: m.visibility,
    publicState: await mediaPublicState(ctx.db, m),
    version: m.version,
    createdAt: m.createdAt,
    permissions: entityPermissions(role, ctx.actor.userId, { ...m, submittedBy: null }),
    usedIn: await usedIn(ctx.db, m.organizationId, m.id),
  };
}
export type MediaDto = Awaited<ReturnType<typeof mediaDto>>;

export async function getMedia(ctx: Ctx, orgId: string, id: string) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  return mediaDto(ctx, await loadMedia(ctx.db, role, orgId, id), role);
}

/** Media change in one transaction; the org is re-projected so covers and galleries follow (08 §4). */
async function changeMedia(ctx: Ctx, orgId: string, id: string, fn: (tx: Tx, m: MediaRow, role: OrgRole) => Promise<Partial<typeof t.mediaAssets.$inferInsert> | null>) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const sync = emptySync();
  const row = await ctx.db.transaction(async (tx) => {
    const m = await loadMedia(tx, role, orgId, id, true);
    const set = await fn(tx, m, role);
    let u = m;
    if (set) {
      [u] = (await tx
        .update(t.mediaAssets)
        .set({ ...set, version: sql`${t.mediaAssets.version} + 1`, updatedBy: ctx.actor.userId, updatedAt: new Date() })
        .where(eq(t.mediaAssets.id, id))
        .returning()) as [MediaRow];
    }
    const [org] = await tx.select().from(t.organizations).where(eq(t.organizations.id, orgId));
    if (isOrgPublic(org!)) await syncPublic(tx, ctx.storage, { kind: 'org', orgId }, sync);
    return u;
  });
  await flushRevalidate(ctx, sync);
  return mediaDto(ctx, (await ctx.db.select().from(t.mediaAssets).where(eq(t.mediaAssets.id, id)))[0] ?? row, role);
}

export async function updateMedia(ctx: Ctx, orgId: string, id: string, raw: unknown) {
  const { version, occurredDate, ...patch } = parse(mediaPatch, raw);
  return changeMedia(ctx, orgId, id, async (tx, m, role) => {
    if (!entityPermissions(role, ctx.actor.userId, { ...m, submittedBy: null }).canEdit) fail('FORBIDDEN');
    if (m.version !== version) fail('VERSION_CONFLICT');
    const set: Partial<typeof t.mediaAssets.$inferInsert> = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    if (occurredDate !== undefined) Object.assign(set, { occurredDate: occurredDate?.date ?? null, occurredDatePrecision: occurredDate?.precision ?? null });
    const changes = diff(m as unknown as Record<string, unknown>, set as Record<string, unknown>);
    if (Object.keys(changes).length) await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'MEDIA_UPDATED', targetType: 'MEDIA', targetId: id, targetLabel: set.title ?? m.title, changes });
    return set;
  });
}

const MEDIA_FLOW = {
  submit: { from: ['DRAFT'], to: 'PENDING_REVIEW', ok: (p: ReturnType<typeof entityPermissions>) => p.canSubmit },
  withdraw: { from: ['PENDING_REVIEW'], to: 'DRAFT', ok: (p: ReturnType<typeof entityPermissions>) => p.canWithdraw },
  approve: { from: ['DRAFT', 'PENDING_REVIEW'], to: 'VERIFIED', ok: (p: ReturnType<typeof entityPermissions>) => p.canApprove },
  return: { from: ['PENDING_REVIEW'], to: 'DRAFT', ok: (p: ReturnType<typeof entityPermissions>) => p.canReturn },
  unverify: { from: ['VERIFIED'], to: 'DRAFT', ok: (p: ReturnType<typeof entityPermissions>) => p.canUnverify },
} as const;

export async function mediaTransition(ctx: Ctx, orgId: string, id: string, action: string, raw: unknown) {
  const def = MEDIA_FLOW[action as keyof typeof MEDIA_FLOW];
  if (!def) return fail('NOT_FOUND');
  const { version } = parse(versionOnly, raw);
  return changeMedia(ctx, orgId, id, async (tx, m, role) => {
    const p = entityPermissions(role, ctx.actor.userId, { ...m, submittedBy: m.createdBy });
    if (!(def.from as readonly string[]).includes(m.status)) fail('INVALID_TRANSITION', { from: m.status, action });
    if (!def.ok(p)) fail('FORBIDDEN');
    if (m.version !== version) fail('VERSION_CONFLICT');
    const set: Partial<typeof t.mediaAssets.$inferInsert> = { status: def.to };
    if (def.to === 'VERIFIED') Object.assign(set, { verifiedBy: ctx.actor.userId, verifiedAt: new Date() });
    if (action === 'unverify') Object.assign(set, { verifiedBy: null, verifiedAt: null, ...(m.visibility === 'PUBLIC' ? { visibility: 'INTERNAL' } : {}) });
    const actions = { submit: 'ENTITY_SUBMITTED', withdraw: 'ENTITY_RETURNED', approve: 'ENTITY_APPROVED', return: 'ENTITY_RETURNED', unverify: 'ENTITY_UNVERIFIED' } as const;
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: actions[action as keyof typeof actions], targetType: 'MEDIA', targetId: id, targetLabel: m.title, changes: { status: [m.status, def.to] } });
    return set;
  });
}

export async function setMediaVisibility(ctx: Ctx, orgId: string, id: string, raw: unknown) {
  const { version, visibility } = parse(visibilityInput, raw);
  return changeMedia(ctx, orgId, id, async (tx, m, role) => {
    if (visibility === 'PUBLIC') {
      if (role !== 'ADMIN') fail('FORBIDDEN');
      if (m.status !== 'VERIFIED') fail('NOT_VERIFIED');
    } else if (!entityPermissions(role, ctx.actor.userId, { ...m, submittedBy: null }).allowedVisibilities.includes(visibility)) fail('FORBIDDEN');
    if (m.version !== version) fail('VERSION_CONFLICT');
    if (m.visibility === visibility) return null;
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'VISIBILITY_CHANGED', targetType: 'MEDIA', targetId: id, targetLabel: m.title, changes: { visibility: [m.visibility, visibility] } });
    return { visibility };
  });
}

export async function deleteMedia(ctx: Ctx, orgId: string, id: string): Promise<void> {
  await changeMedia(ctx, orgId, id, async (tx, m, role) => {
    if (!entityPermissions(role, ctx.actor.userId, { ...m, submittedBy: null }).canDelete) fail('FORBIDDEN');
    if ((await usedIn(tx, orgId, id)).length) fail('MEDIA_IN_USE');
    await tx.delete(t.entitySources).where(eq(t.entitySources.mediaId, id));
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'MEDIA_DELETED', targetType: 'MEDIA', targetId: id, targetLabel: m.title });
    return { deletedAt: new Date() };
  });
}

/**
 * Upload through the Hub when the browser cannot PUT to storage directly (bucket CORS not set).
 * Vercel limits request bodies to about 4.5 MB, so the client only uses this for small files.
 */
export async function uploadThroughHub(ctx: Ctx, orgId: string, mediaId: string, body: Uint8Array) {
  await requireMember(ctx.db, ctx.actor, orgId);
  const [m] = await ctx.db
    .select()
    .from(t.mediaAssets)
    .where(and(eq(t.mediaAssets.id, mediaId), eq(t.mediaAssets.organizationId, orgId), isNull(t.mediaAssets.deletedAt)));
  if (!m || m.createdBy !== ctx.actor.userId || m.uploadStatus === 'READY') return fail('NOT_FOUND');
  if (body.byteLength !== m.sizeBytes) fail('UPLOAD_MISMATCH');
  await requireStorage(ctx).putPrivate(m.storageKey, body, m.mimeType);
  return { ok: true };
}

/** Gallery of a content item (PUT .../media): order = array order. */
export async function entityMediaList(ctx: Ctx, orgId: string, type: string, id: string, role: OrgRole) {
  const rows = await ctx.db
    .select({ m: t.mediaAssets, caption: t.entityMedia.caption })
    .from(t.entityMedia)
    .innerJoin(t.mediaAssets, eq(t.mediaAssets.id, t.entityMedia.mediaId))
    .where(and(eq(t.entityMedia.entityType, type as 'EVENT'), eq(t.entityMedia.entityId, id), isNull(t.mediaAssets.deletedAt), visibleMedia(role)))
    .orderBy(asc(t.entityMedia.sortOrder));
  return Promise.all(rows.map(async (r) => ({ ...(await mediaRef(ctx, r.m)), caption: r.caption, visibility: r.m.visibility, isPublic: isMediaPublic(r.m) })));
}

export async function replaceEntityMedia(tx: Tx, orgId: string, type: string, id: string, raw: unknown) {
  const { items } = parse(entityMediaInput, raw);
  const ids = [...new Set(items.map((i) => i.mediaId))];
  if (ids.length) {
    const ok = await tx
      .select({ id: t.mediaAssets.id, kind: t.mediaAssets.kind, status: t.mediaAssets.uploadStatus })
      .from(t.mediaAssets)
      .where(and(inArray(t.mediaAssets.id, ids), eq(t.mediaAssets.organizationId, orgId), isNull(t.mediaAssets.deletedAt)));
    if (ok.length !== ids.length) fail('VALIDATION_FAILED', { fields: { items: 'Không tìm thấy tư liệu' } });
    if (ok.some((m) => m.status !== 'READY')) fail('MEDIA_NOT_READY');
    if (ok.some((m) => m.kind !== 'IMAGE' && m.kind !== 'VIDEO')) fail('MEDIA_KIND_INVALID');
  }
  await tx.delete(t.entityMedia).where(and(eq(t.entityMedia.entityType, type as 'EVENT'), eq(t.entityMedia.entityId, id)));
  const seen = new Set<string>();
  let i = 0;
  for (const it of items) {
    if (seen.has(it.mediaId)) continue;
    seen.add(it.mediaId);
    await tx.insert(t.entityMedia).values({ organizationId: orgId, entityType: type as 'EVENT', entityId: id, mediaId: it.mediaId, sortOrder: i++, caption: it.caption });
  }
}
