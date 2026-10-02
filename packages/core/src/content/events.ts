// Events (Culture Timeline): docs/spec/05-api.yaml /orgs/{orgId}/events, 06-hub-man-hinh.md §6–7.
import { and, asc, count, desc, eq, inArray, isNull, ne, sql, type SQL } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { coreTables as t } from '@nexture/db';
import { EVENT_TYPES, eventInput, eventPatch, type EventInput, type EventPatch } from '@nexture/contracts';
import { diff, logActivity } from '../activity';
import { canOrg, entityPermissions } from '../authz';
import { requireMember, type Ctx, type DbOrTx } from '../context';
import { fail } from '../errors';
import { mediaRefById } from '../media';
import { atlasPath } from '../public/sync';
import { publicState } from '../public/rules';
import { parse } from '../validate';
import { cleanHtml } from './html';
import { afterContentChange } from './workflow';
import type { OrgRole } from '@nexture/contracts';

export type EventRow = typeof t.events.$inferSelect;
type OrgPublic = { atlasEnabled: boolean; atlasHiddenAt: Date | null; slug: string };

/** Viewer filter, 03-phan-quyen §3. */
export const visibleTo = (role: OrgRole): SQL | undefined =>
  role === 'VIEWER' ? and(eq(t.events.status, 'VERIFIED'), ne(t.events.visibility, 'PRIVATE')) : undefined;

async function orgPublic(db: DbOrTx, orgId: string): Promise<OrgPublic> {
  const [o] = await db
    .select({ atlasEnabled: t.organizations.atlasEnabled, atlasHiddenAt: t.organizations.atlasHiddenAt, slug: t.organizations.slug })
    .from(t.organizations)
    .where(eq(t.organizations.id, orgId));
  return o!;
}

async function userNames(db: DbOrTx, ids: (string | null)[]) {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!unique.length) return new Map<string, string>();
  const rows = await db.select({ id: t.user.id, name: t.user.name }).from(t.user).where(inArray(t.user.id, unique));
  return new Map(rows.map((r) => [r.id, r.name]));
}

const ref = (names: Map<string, string>, id: string | null) => (id ? { id, name: names.get(id) ?? 'Người dùng đã rời' } : null);
const fuzzy = (date: string | null, precision: string | null) => (date && precision ? { date, precision: precision as 'YEAR' | 'MONTH' | 'DAY' } : null);

export async function eventDto(ctx: Ctx, e: EventRow, role: OrgRole, org?: OrgPublic) {
  const o = org ?? (await orgPublic(ctx.db, e.organizationId));
  const names = await userNames(ctx.db, [e.createdBy, e.updatedBy, e.verifiedBy, e.submittedBy]);
  const state = publicState(e, o);
  const atlasBase = ctx.atlas?.baseUrl ?? process.env.ATLAS_BASE_URL;
  return {
    type: 'EVENT' as const,
    id: e.id,
    organizationId: e.organizationId,
    eventType: e.eventType,
    titleVi: e.titleVi,
    titleEn: e.titleEn,
    summaryVi: e.summaryVi,
    summaryEn: e.summaryEn,
    contentVi: e.contentVi,
    contentEn: e.contentEn,
    startDate: fuzzy(e.startDate, e.startDatePrecision)!,
    endDate: fuzzy(e.endDate, e.endDatePrecision),
    coverMediaId: e.coverMediaId,
    cover: await mediaRefById(ctx, e.organizationId, e.coverMediaId),
    internalNotes: role === 'VIEWER' ? null : e.internalNotes,
    status: e.status,
    visibility: e.visibility,
    publicState: state,
    publicUrl: state === 'LIVE' && e.publicSlug && atlasBase ? `${atlasBase.replace(/\/$/, '')}${atlasPath('EVENT', e.publicSlug)}` : null,
    returnNote: e.returnNote,
    atlasHiddenReason: e.atlasHiddenReason,
    version: e.version,
    createdBy: ref(names, e.createdBy)!,
    createdAt: e.createdAt,
    updatedBy: ref(names, e.updatedBy)!,
    updatedAt: e.updatedAt,
    verifiedBy: ref(names, e.verifiedBy),
    verifiedAt: e.verifiedAt,
    submittedBy: ref(names, e.submittedBy),
    submittedAt: e.submittedAt,
    permissions: entityPermissions(role, ctx.actor.userId, e),
    related: { stories: [], events: [], people: [], products: [], values: [] },
    media: [],
    sources: [],
  };
}
export type EventDto = Awaited<ReturnType<typeof eventDto>>;

/** Loads an event the caller may see; 404 otherwise. */
export async function loadEvent(db: DbOrTx, role: OrgRole, orgId: string, id: string, forUpdate = false) {
  const q = db
    .select()
    .from(t.events)
    .where(and(eq(t.events.id, id), eq(t.events.organizationId, orgId), isNull(t.events.deletedAt), visibleTo(role)));
  const [e] = forUpdate ? await q.for('update') : await q;
  if (!e) return fail('NOT_FOUND');
  return e;
}

export async function getEvent(ctx: Ctx, orgId: string, id: string) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  return eventDto(ctx, await loadEvent(ctx.db, role, orgId, id), role);
}

async function checkCover(db: DbOrTx, orgId: string, coverMediaId: string | null | undefined) {
  if (!coverMediaId) return;
  const [m] = await db
    .select({ kind: t.mediaAssets.kind, status: t.mediaAssets.uploadStatus })
    .from(t.mediaAssets)
    .where(and(eq(t.mediaAssets.id, coverMediaId), eq(t.mediaAssets.organizationId, orgId), isNull(t.mediaAssets.deletedAt)));
  if (!m) fail('VALIDATION_FAILED', { fields: { coverMediaId: 'Không tìm thấy ảnh' } });
  if (m!.status !== 'READY') fail('MEDIA_NOT_READY');
  if (m!.kind !== 'IMAGE') fail('MEDIA_KIND_INVALID');
}

function checkDates(start: { date: string } | undefined, end: { date: string } | null | undefined) {
  if (start && end && end.date < start.date) fail('VALIDATION_FAILED', { fields: { endDate: 'Ngày kết thúc phải sau ngày bắt đầu' } });
}

export async function createEvent(ctx: Ctx, orgId: string, raw: EventInput | unknown) {
  const input = parse(eventInput, raw);
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'content.create')) fail('FORBIDDEN');
  if (input.status === 'VERIFIED' && role !== 'ADMIN') fail('FORBIDDEN');
  checkDates(input.startDate, input.endDate);
  await checkCover(ctx.db, orgId, input.coverMediaId);
  const { userId } = ctx.actor;
  const id = uuidv7();
  const now = new Date();
  const row = await ctx.db.transaction(async (tx) => {
    const [e] = await tx
      .insert(t.events)
      .values({
        id,
        organizationId: orgId,
        eventType: input.eventType,
        titleVi: input.titleVi,
        titleEn: input.titleEn,
        summaryVi: input.summaryVi,
        summaryEn: input.summaryEn,
        contentVi: cleanHtml(input.contentVi),
        contentEn: cleanHtml(input.contentEn),
        startDate: input.startDate.date,
        startDatePrecision: input.startDate.precision,
        endDate: input.endDate?.date ?? null,
        endDatePrecision: input.endDate?.precision ?? null,
        coverMediaId: input.coverMediaId ?? null,
        internalNotes: input.internalNotes,
        status: input.status,
        visibility: input.visibility,
        ...(input.status === 'VERIFIED' ? { verifiedBy: userId, verifiedAt: now } : {}),
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();
    await logActivity(tx, { organizationId: orgId, actorId: userId, action: 'ENTITY_CREATED', targetType: 'EVENT', targetId: id, targetLabel: input.titleVi });
    if (input.status === 'VERIFIED') {
      await logActivity(tx, { organizationId: orgId, actorId: userId, action: 'ENTITY_APPROVED', targetType: 'EVENT', targetId: id, targetLabel: input.titleVi });
    }
    return e!;
  });
  return eventDto(ctx, row, role);
}

export async function updateEvent(ctx: Ctx, orgId: string, id: string, raw: EventPatch | unknown) {
  const { version, ...patch } = parse(eventPatch, raw);
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  return afterContentChange(ctx, orgId, { type: 'EVENT', id }, async (tx) => {
    const e = await loadEvent(tx, role, orgId, id, true);
    if (!entityPermissions(role, ctx.actor.userId, e).canEdit) fail('FORBIDDEN');
    if (e.version !== version) fail('VERSION_CONFLICT');
    const start = patch.startDate ?? { date: e.startDate, precision: e.startDatePrecision };
    const end = patch.endDate === undefined ? fuzzy(e.endDate, e.endDatePrecision) : patch.endDate;
    checkDates(start, end);
    await checkCover(tx, orgId, patch.coverMediaId);
    const set: Partial<typeof t.events.$inferInsert> = {};
    if (patch.eventType !== undefined) set.eventType = patch.eventType;
    if (patch.titleVi !== undefined) set.titleVi = patch.titleVi;
    if (patch.titleEn !== undefined) set.titleEn = patch.titleEn;
    if (patch.summaryVi !== undefined) set.summaryVi = patch.summaryVi;
    if (patch.summaryEn !== undefined) set.summaryEn = patch.summaryEn;
    if (patch.contentVi !== undefined) set.contentVi = cleanHtml(patch.contentVi);
    if (patch.contentEn !== undefined) set.contentEn = cleanHtml(patch.contentEn);
    if (patch.startDate) Object.assign(set, { startDate: patch.startDate.date, startDatePrecision: patch.startDate.precision });
    if (patch.endDate !== undefined) Object.assign(set, { endDate: patch.endDate?.date ?? null, endDatePrecision: patch.endDate?.precision ?? null });
    if (patch.coverMediaId !== undefined) set.coverMediaId = patch.coverMediaId;
    if (patch.internalNotes !== undefined) set.internalNotes = patch.internalNotes;
    const changes = diff(e as unknown as Record<string, unknown>, set as Record<string, unknown>);
    const [u] = await tx
      .update(t.events)
      .set({ ...set, version: sql`${t.events.version} + 1`, updatedBy: ctx.actor.userId, updatedAt: new Date() })
      .where(eq(t.events.id, id))
      .returning();
    if (Object.keys(changes).length) {
      await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ENTITY_UPDATED', targetType: 'EVENT', targetId: id, targetLabel: u!.titleVi, changes });
    }
    return { row: u!, role };
  });
}

export async function deleteEvent(ctx: Ctx, orgId: string, id: string): Promise<void> {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  await afterContentChange(ctx, orgId, { type: 'EVENT', id }, async (tx) => {
    const e = await loadEvent(tx, role, orgId, id, true);
    if (!entityPermissions(role, ctx.actor.userId, e).canDelete) fail('FORBIDDEN');
    const [u] = await tx.update(t.events).set({ deletedAt: new Date(), updatedBy: ctx.actor.userId, updatedAt: new Date() }).where(eq(t.events.id, id)).returning();
    // 02-database-ghi-chu §10: relations of a soft-deleted item are removed.
    await tx.execute(sql`DELETE FROM core.relationships WHERE (source_type = 'EVENT' AND source_id = ${id}) OR (target_type = 'EVENT' AND target_id = ${id})`);
    await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ENTITY_DELETED', targetType: 'EVENT', targetId: id, targetLabel: e.titleVi });
    return { row: u!, role };
  });
}

const SORTS = {
  date_asc: [asc(t.events.startDate), asc(t.events.titleVi)],
  date_desc: [desc(t.events.startDate), asc(t.events.titleVi)],
  updated_desc: [desc(t.events.updatedAt)],
  title_asc: [asc(t.events.titleVi)],
} as const;

export type EventListQuery = { page?: number; pageSize?: number; q?: string; status?: string; visibility?: string; eventType?: string; sort?: string };

export async function listEvents(ctx: Ctx, orgId: string, query: EventListQuery = {}) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  const sort = (query.sort ?? 'date_asc') as keyof typeof SORTS;
  if (!SORTS[sort]) fail('VALIDATION_FAILED', { fields: { sort: 'Không hợp lệ' } });
  const conds: (SQL | undefined)[] = [eq(t.events.organizationId, orgId), isNull(t.events.deletedAt), visibleTo(role)];
  if (query.status) conds.push(eq(t.events.status, query.status as EventRow['status']));
  if (query.visibility) conds.push(eq(t.events.visibility, query.visibility as EventRow['visibility']));
  if (query.eventType && (EVENT_TYPES as readonly string[]).includes(query.eventType)) conds.push(eq(t.events.eventType, query.eventType as EventRow['eventType']));
  const q = query.q?.trim();
  if (q && q.length >= 2) {
    conds.push(sql`(core.f_search_norm(${t.events.titleVi}) LIKE '%' || core.f_search_norm(${q}) || '%' OR core.f_search_norm(coalesce(${t.events.summaryVi}, '')) LIKE '%' || core.f_search_norm(${q}) || '%')`);
  } else if (q) {
    return { items: [], page, pageSize, total: 0 };
  }
  const where = and(...conds);
  const [{ total } = { total: 0 }] = await ctx.db.select({ total: count() }).from(t.events).where(where);
  const rows = await ctx.db.select().from(t.events).where(where).orderBy(...SORTS[sort]).limit(pageSize).offset((page - 1) * pageSize);
  const org = await orgPublic(ctx.db, orgId);
  return {
    page,
    pageSize,
    total,
    items: rows.map((e) => ({
      id: e.id,
      type: 'EVENT' as const,
      title: e.titleVi,
      subtitle: e.eventType,
      summary: e.summaryVi,
      date: fuzzy(e.startDate, e.startDatePrecision),
      endDate: fuzzy(e.endDate, e.endDatePrecision),
      thumbnailUrl: null,
      status: e.status,
      visibility: e.visibility,
      publicState: publicState(e, org),
      updatedAt: e.updatedAt,
    })),
  };
}
