// Events (Culture Timeline): docs/spec/05-api.yaml /orgs/{orgId}/events, 06-hub-man-hinh.md §6–7.
import { asc, desc, eq, sql } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import { EVENT_TYPE_LABELS, EVENT_TYPES, eventInput, eventPatch, type EventInput, type EventPatch } from '@nexture/contracts';
import type { Ctx } from '../context';
import { fail } from '../errors';
import { parse } from '../validate';
import {
  checkImage,
  deleteContent,
  fuzzy,
  getContent,
  insertContent,
  listContent,
  patchContent,
  type ContentListQuery,
  type KindDef,
} from './engine';
import { cleanHtml } from './html';

export type EventRow = typeof t.events.$inferSelect;
type Tbl = typeof t.events;

export const EVENT_KIND = {
  type: 'EVENT',
  collection: 'events',
  table: t.events,
  title: (e) => e.titleVi,
  required: () => [],
  coverId: (e) => e.coverMediaId,
  fields: (e) => ({
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
  }),
  listItem: (e) => ({
    subtitle: EVENT_TYPE_LABELS[e.eventType],
    summary: e.summaryVi,
    date: fuzzy(e.startDate, e.startDatePrecision),
    endDate: fuzzy(e.endDate, e.endDatePrecision),
  }),
  searchText: (x: Tbl) => sql`${x.titleVi} || ' ' || coalesce(${x.summaryVi}, '')`,
  sorts: (x: Tbl) => ({
    date_asc: [asc(x.startDate), asc(x.titleVi)],
    date_desc: [desc(x.startDate), asc(x.titleVi)],
    updated_desc: [desc(x.updatedAt)],
    title_asc: [asc(x.titleVi)],
  }),
  defaultSort: 'date_asc',
  dateCol: (x) => x.startDate,
  filters: (x: Tbl, q) => [
    q.eventType && (EVENT_TYPES as readonly string[]).includes(q.eventType) ? eq(x.eventType, q.eventType as EventRow['eventType']) : undefined,
  ],
} satisfies KindDef<EventRow>;

function checkDates(start: { date: string } | null | undefined, end: { date: string } | null | undefined) {
  if (start && end && end.date < start.date) fail('VALIDATION_FAILED', { fields: { endDate: 'Ngày kết thúc phải sau ngày bắt đầu' } });
}

export const getEvent = (ctx: Ctx, orgId: string, id: string) => getContent(ctx, EVENT_KIND, orgId, id);
export type EventDto = Awaited<ReturnType<typeof getEvent>>;

export async function createEvent(ctx: Ctx, orgId: string, raw: EventInput | unknown) {
  const input = parse(eventInput, raw);
  checkDates(input.startDate, input.endDate);
  await checkImage(ctx.db, orgId, input.coverMediaId);
  return insertContent(ctx, EVENT_KIND, orgId, input, {
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
  });
}

export async function updateEvent(ctx: Ctx, orgId: string, id: string, raw: EventPatch | unknown) {
  const { version, ...patch } = parse(eventPatch, raw);
  return patchContent<EventRow, ReturnType<typeof EVENT_KIND.fields>>(ctx, EVENT_KIND, orgId, id, version, async (e, tx) => {
    const start = patch.startDate ?? { date: e.startDate, precision: e.startDatePrecision };
    const end = patch.endDate === undefined ? fuzzy(e.endDate, e.endDatePrecision) : patch.endDate;
    checkDates(start, end);
    await checkImage(tx, orgId, patch.coverMediaId);
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
    return set;
  });
}

export const deleteEvent = (ctx: Ctx, orgId: string, id: string) => deleteContent(ctx, EVENT_KIND, orgId, id);

export type EventListQuery = ContentListQuery & { eventType?: string };
export const listEvents = (ctx: Ctx, orgId: string, query: EventListQuery = {}) => listContent(ctx, EVENT_KIND, orgId, query);
