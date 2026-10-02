// Read-only views across kinds (05-api.yaml tag "views"): Culture Timeline, review queue, search, activity log.
import { and, asc, count, desc, eq, inArray, isNull, sql, type SQL } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import { EVENT_TYPES } from '@nexture/contracts';
import { canOrg } from './authz';
import { requireMember, type Ctx } from './context';
import { fuzzy, listContent, tableOf, visibleIn, type ContentType } from './content/engine';
import { KINDS } from './content/registry';
import { fail } from './errors';
import { listMedia, mediaRefById } from './media';

const UUID = /^[0-9a-f-]{36}$/i;

export type TimelineQuery = { includeUnverified?: string | boolean; eventType?: string; personId?: string; valueId?: string };

/** Every event, grouped by year (06 §8). Viewers always get verified, non-private events only. */
export async function timeline(ctx: Ctx, orgId: string, query: TimelineQuery = {}) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const e = t.events;
  const includeUnverified = role !== 'VIEWER' && (query.includeUnverified === true || query.includeUnverified === 'true' || query.includeUnverified === '1');
  const conds: (SQL | undefined)[] = [eq(e.organizationId, orgId), isNull(e.deletedAt), visibleIn(e, role)];
  if (!includeUnverified) conds.push(eq(e.status, 'VERIFIED'));
  if (query.eventType && (EVENT_TYPES as readonly string[]).includes(query.eventType)) conds.push(eq(e.eventType, query.eventType as (typeof EVENT_TYPES)[number]));
  if (query.personId && UUID.test(query.personId)) conds.push(sql`${e.id} IN (SELECT target_id FROM core.relationships WHERE source_type = 'PERSON' AND source_id = ${query.personId})`);
  if (query.valueId && UUID.test(query.valueId)) conds.push(sql`${e.id} IN (SELECT source_id FROM core.relationships WHERE target_type = 'CULTURE_VALUE' AND target_id = ${query.valueId})`);
  const rows = await ctx.db.select().from(e).where(and(...conds)).orderBy(asc(e.startDate), asc(e.titleVi));

  // People linked to each event (visible to the caller), with avatars.
  const ids = rows.map((r) => r.id);
  const people = new Map<string, { id: string; name: string; avatarUrl: string | null }[]>();
  if (ids.length) {
    const p = t.people;
    const links = await ctx.db
      .select({ eventId: t.relationships.targetId, id: p.id, name: p.fullName, avatar: p.avatarMediaId })
      .from(t.relationships)
      .innerJoin(p, eq(p.id, t.relationships.sourceId))
      .where(and(eq(t.relationships.sourceType, 'PERSON'), eq(t.relationships.targetType, 'EVENT'), inArray(t.relationships.targetId, ids), isNull(p.deletedAt), visibleIn(p as never, role)))
      .orderBy(asc(p.fullName));
    for (const l of links) {
      const ref = await mediaRefById(ctx, orgId, l.avatar);
      people.set(l.eventId, [...(people.get(l.eventId) ?? []), { id: l.id, name: l.name, avatarUrl: ref?.url ?? null }]);
    }
  }

  const years: { year: number; items: unknown[] }[] = [];
  for (const r of rows) {
    const year = Number(r.startDate.slice(0, 4));
    let group = years.at(-1);
    if (!group || group.year !== year) years.push((group = { year, items: [] }));
    const cover = await mediaRefById(ctx, orgId, r.coverMediaId);
    group.items.push({
      id: r.id,
      title: r.titleVi,
      eventType: r.eventType,
      summary: r.summaryVi,
      date: fuzzy(r.startDate, r.startDatePrecision),
      endDate: fuzzy(r.endDate, r.endDatePrecision),
      status: r.status,
      visibility: r.visibility,
      thumbnailUrl: cover?.url ?? null,
      people: people.get(r.id) ?? [],
    });
  }
  return { includeUnverified, years };
}
export type TimelineItem = {
  id: string;
  title: string;
  eventType: (typeof EVENT_TYPES)[number];
  summary: string | null;
  date: { date: string; precision: 'YEAR' | 'MONTH' | 'DAY' };
  endDate: { date: string; precision: 'YEAR' | 'MONTH' | 'DAY' } | null;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'VERIFIED';
  visibility: 'PRIVATE' | 'INTERNAL' | 'PUBLIC';
  thumbnailUrl: string | null;
  people: { id: string; name: string; avatarUrl: string | null }[];
};

const COLLECTION: Record<ContentType, string> = { STORY: 'stories', EVENT: 'events', PERSON: 'people', PRODUCT_PROJECT: 'products' };

/** Everything waiting for an admin, oldest submission first (06 §11). ADMIN and EDITOR. */
export async function reviewQueue(ctx: Ctx, orgId: string) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'review.view')) fail('FORBIDDEN');
  const items: { type: string; collection: string; id: string; title: string; version: number; submittedBy: string | null; submittedAt: Date; thumbnailUrl: string | null }[] = [];
  for (const type of Object.keys(COLLECTION) as ContentType[]) {
    const tbl = tableOf(type);
    const title = type === 'PERSON' ? t.people.fullName : tbl.titleVi;
    const cover = type === 'PERSON' ? t.people.avatarMediaId : tbl.coverMediaId;
    const rows = await ctx.db
      .select({ id: tbl.id, title, version: tbl.version, by: tbl.submittedBy, at: tbl.submittedAt, updatedAt: tbl.updatedAt, cover })
      .from(tbl)
      .where(and(eq(tbl.organizationId, orgId), isNull(tbl.deletedAt), eq(tbl.status, 'PENDING_REVIEW')));
    for (const r of rows) {
      const ref = await mediaRefById(ctx, orgId, r.cover);
      items.push({ type, collection: COLLECTION[type], id: r.id, title: r.title, version: r.version, submittedBy: r.by, submittedAt: r.at ?? r.updatedAt, thumbnailUrl: ref?.url ?? null });
    }
  }
  const m = t.mediaAssets;
  const media = await ctx.db
    .select()
    .from(m)
    .where(and(eq(m.organizationId, orgId), isNull(m.deletedAt), eq(m.status, 'PENDING_REVIEW')));
  for (const r of media) {
    const ref = r.kind === 'IMAGE' ? await mediaRefById(ctx, orgId, r.id) : null;
    items.push({ type: 'MEDIA', collection: 'media', id: r.id, title: r.title, version: r.version, submittedBy: r.updatedBy, submittedAt: r.updatedAt, thumbnailUrl: ref?.url ?? null });
  }
  const names = await userNames(ctx, items.map((i) => i.submittedBy));
  return {
    items: items
      .sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime())
      .map((i) => ({ ...i, submittedBy: i.submittedBy ? { id: i.submittedBy, name: names.get(i.submittedBy) ?? 'Người dùng đã rời' } : null })),
  };
}

async function userNames(ctx: Ctx, ids: (string | null)[]) {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!unique.length) return new Map<string, string>();
  const rows = await ctx.db.select({ id: t.user.id, name: t.user.name }).from(t.user).where(inArray(t.user.id, unique));
  return new Map(rows.map((r) => [r.id, r.name]));
}

/** Activity log of one org, newest first (06 §14.3). ADMIN only. */
export async function listActivity(ctx: Ctx, orgId: string, query: { page?: string | number; pageSize?: string | number } = {}) {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  if (!canOrg(role, 'activity.view')) fail('FORBIDDEN');
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 30));
  const l = t.activityLogs;
  const where = eq(l.organizationId, orgId);
  const [{ total } = { total: 0 }] = await ctx.db.select({ total: count() }).from(l).where(where);
  const rows = await ctx.db
    .select()
    .from(l)
    .where(where)
    .orderBy(desc(l.createdAt), desc(l.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const names = await userNames(ctx, rows.map((r) => r.actorId));
  return {
    page,
    pageSize,
    total,
    items: rows.map((r) => ({
      id: r.id,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      targetLabel: r.targetLabel,
      changes: r.changes as Record<string, [unknown, unknown]> | null,
      actor: r.actorId ? { id: r.actorId, name: names.get(r.actorId) ?? 'Người dùng đã rời' } : null,
      createdAt: r.createdAt,
    })),
  };
}

const SEARCH_KINDS = { STORY: 'stories', EVENT: 'events', PERSON: 'people', PRODUCT_PROJECT: 'products' } as const;
export type SearchQuery = { q?: string; types?: string; status?: string; personId?: string };

/** Hub search (06 §13): up to 20 hits per kind, accent-insensitive. */
export async function searchOrg(ctx: Ctx, orgId: string, query: SearchQuery = {}) {
  await requireMember(ctx.db, ctx.actor, orgId);
  const q = (query.q ?? '').trim().slice(0, 100);
  if (q.length < 2) return { q, groups: [] };
  const wanted = new Set((query.types ?? '').split(',').filter(Boolean));
  const pick = (t: string) => !wanted.size || wanted.has(t);
  const groups: { type: string; collection: string; total: number; items: { id: string; title: string; subtitle: string | null; status: string; thumbnailUrl: string | null }[] }[] = [];
  for (const [type, collection] of Object.entries(SEARCH_KINDS)) {
    if (!pick(type)) continue;
    const r = await listContent(ctx, KINDS[collection]!, orgId, { q, pageSize: 20, status: query.status || undefined, personId: query.personId || undefined });
    if (r.total) groups.push({ type, collection, total: r.total, items: r.items.map((i) => ({ id: i.id, title: i.title, subtitle: i.subtitle, status: i.status, thumbnailUrl: i.thumbnailUrl })) });
  }
  if (pick('MEDIA') && !query.personId) {
    const r = await listMedia(ctx, orgId, { q, pageSize: 20, status: query.status || undefined });
    if (r.total) groups.push({ type: 'MEDIA', collection: 'library', total: r.total, items: r.items.map((m) => ({ id: m.id, title: m.title, subtitle: null, status: m.status, thumbnailUrl: m.kind === 'IMAGE' ? m.url : null })) });
  }
  return { q, groups };
}
