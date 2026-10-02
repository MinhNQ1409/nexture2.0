// Stories: docs/spec/05-api.yaml /orgs/{orgId}/stories, 06-hub-man-hinh.md §6–7.
import { asc, desc, eq, sql } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import { STORY_TYPE_LABELS, STORY_TYPES, storyInput, storyPatch, type StoryInput } from '@nexture/contracts';
import type { Ctx } from '../context';
import { parse } from '../validate';
import { checkImage, deleteContent, fuzzy, getContent, insertContent, listContent, patchContent, type ContentListQuery, type KindDef } from './engine';
import { cleanHtml } from './html';

export type StoryRow = typeof t.stories.$inferSelect;
type Tbl = typeof t.stories;

export const STORY_KIND = {
  type: 'STORY',
  collection: 'stories',
  table: t.stories,
  title: (s) => s.titleVi,
  required: (s) => [!s.summaryVi && 'summaryVi', !s.contentVi && 'contentVi'].filter((x): x is string => Boolean(x)),
  coverId: (s) => s.coverMediaId,
  fields: (s) => ({
    storyType: s.storyType,
    titleVi: s.titleVi,
    titleEn: s.titleEn,
    summaryVi: s.summaryVi,
    summaryEn: s.summaryEn,
    contentVi: s.contentVi,
    contentEn: s.contentEn,
    storyDate: fuzzy(s.storyDate, s.storyDatePrecision),
    coverMediaId: s.coverMediaId,
  }),
  listItem: (s) => ({ subtitle: STORY_TYPE_LABELS[s.storyType], summary: s.summaryVi, date: fuzzy(s.storyDate, s.storyDatePrecision), endDate: null }),
  searchText: (x: Tbl) => sql`${x.titleVi} || ' ' || coalesce(${x.summaryVi}, '')`,
  sorts: (x: Tbl) => ({
    updated_desc: [desc(x.updatedAt)],
    date_desc: [sql`${x.storyDate} DESC NULLS LAST`, asc(x.titleVi)],
    date_asc: [sql`${x.storyDate} ASC NULLS LAST`, asc(x.titleVi)],
    title_asc: [asc(x.titleVi)],
  }),
  defaultSort: 'updated_desc',
  dateCol: (x) => x.storyDate,
  filters: (x: Tbl, q) => [q.storyType && (STORY_TYPES as readonly string[]).includes(q.storyType) ? eq(x.storyType, q.storyType as StoryRow['storyType']) : undefined],
} satisfies KindDef<StoryRow>;

export const getStory = (ctx: Ctx, orgId: string, id: string) => getContent(ctx, STORY_KIND, orgId, id);
export type StoryDto = Awaited<ReturnType<typeof getStory>>;

export async function createStory(ctx: Ctx, orgId: string, raw: StoryInput | unknown) {
  const input = parse(storyInput, raw);
  await checkImage(ctx.db, orgId, input.coverMediaId);
  return insertContent(ctx, STORY_KIND, orgId, input, {
    storyType: input.storyType,
    titleVi: input.titleVi,
    titleEn: input.titleEn,
    summaryVi: input.summaryVi,
    summaryEn: input.summaryEn,
    contentVi: cleanHtml(input.contentVi),
    contentEn: cleanHtml(input.contentEn),
    storyDate: input.storyDate?.date ?? null,
    storyDatePrecision: input.storyDate?.precision ?? null,
    coverMediaId: input.coverMediaId ?? null,
  });
}

export async function updateStory(ctx: Ctx, orgId: string, id: string, raw: unknown) {
  const { version, ...patch } = parse(storyPatch, raw);
  return patchContent<StoryRow, ReturnType<typeof STORY_KIND.fields>>(ctx, STORY_KIND, orgId, id, version, async (_s, tx) => {
    await checkImage(tx, orgId, patch.coverMediaId);
    const set: Partial<typeof t.stories.$inferInsert> = {};
    if (patch.storyType !== undefined) set.storyType = patch.storyType;
    if (patch.titleVi !== undefined) set.titleVi = patch.titleVi;
    if (patch.titleEn !== undefined) set.titleEn = patch.titleEn;
    if (patch.summaryVi !== undefined) set.summaryVi = patch.summaryVi;
    if (patch.summaryEn !== undefined) set.summaryEn = patch.summaryEn;
    if (patch.contentVi !== undefined) set.contentVi = cleanHtml(patch.contentVi);
    if (patch.contentEn !== undefined) set.contentEn = cleanHtml(patch.contentEn);
    if (patch.storyDate !== undefined) Object.assign(set, { storyDate: patch.storyDate?.date ?? null, storyDatePrecision: patch.storyDate?.precision ?? null });
    if (patch.coverMediaId !== undefined) set.coverMediaId = patch.coverMediaId;
    if (patch.internalNotes !== undefined) set.internalNotes = patch.internalNotes;
    return set;
  });
}

export const deleteStory = (ctx: Ctx, orgId: string, id: string) => deleteContent(ctx, STORY_KIND, orgId, id);
export const listStories = (ctx: Ctx, orgId: string, query: ContentListQuery = {}) => listContent(ctx, STORY_KIND, orgId, query);
