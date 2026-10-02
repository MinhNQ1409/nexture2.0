// People: docs/spec/05-api.yaml /orgs/{orgId}/people, 06-hub-man-hinh.md §6–7.
import { asc, desc, eq, sql } from 'drizzle-orm';
import { coreTables as t } from '@nexture/db';
import { personInput, personPatch, type PersonInput } from '@nexture/contracts';
import type { Ctx } from '../context';
import { fail } from '../errors';
import { parse } from '../validate';
import { checkImage, deleteContent, fuzzy, getContent, insertContent, listContent, patchContent, type ContentListQuery, type KindDef } from './engine';
import { cleanHtml } from './html';

export type PersonRow = typeof t.people.$inferSelect;
type Tbl = typeof t.people;

export const PERSON_KIND = {
  type: 'PERSON',
  collection: 'people',
  table: t.people,
  title: (p) => p.fullName,
  required: (p) => (p.roleTitleVi ? [] : ['roleTitleVi']),
  coverId: (p) => p.avatarMediaId,
  fields: (p) => ({
    fullName: p.fullName,
    roleTitleVi: p.roleTitleVi,
    roleTitleEn: p.roleTitleEn,
    isFounder: p.isFounder,
    joinedDate: fuzzy(p.joinedDate, p.joinedDatePrecision),
    leftDate: fuzzy(p.leftDate, p.leftDatePrecision),
    bioVi: p.bioVi,
    bioEn: p.bioEn,
    contributionsVi: p.contributionsVi,
    contributionsEn: p.contributionsEn,
    avatarMediaId: p.avatarMediaId,
  }),
  listItem: (p) => ({
    subtitle: [p.isFounder ? 'Người sáng lập' : null, p.roleTitleVi].filter(Boolean).join(' · ') || null,
    summary: null,
    date: fuzzy(p.joinedDate, p.joinedDatePrecision),
    endDate: fuzzy(p.leftDate, p.leftDatePrecision),
  }),
  searchText: (x: Tbl) => sql`${x.fullName} || ' ' || coalesce(${x.roleTitleVi}, '')`,
  sorts: (x: Tbl) => ({
    founder_first: [desc(x.isFounder), asc(x.fullName)],
    name_asc: [asc(x.fullName)],
    updated_desc: [desc(x.updatedAt)],
    joined_asc: [sql`${x.joinedDate} ASC NULLS LAST`, asc(x.fullName)],
  }),
  defaultSort: 'founder_first',
  filters: (x: Tbl, q) => [q.founder === '1' || q.founder === 'true' ? eq(x.isFounder, true) : undefined],
} satisfies KindDef<PersonRow>;

function checkDates(joined: { date: string } | null | undefined, left: { date: string } | null | undefined) {
  if (joined && left && left.date < joined.date) fail('VALIDATION_FAILED', { fields: { leftDate: 'Thời gian rời đi phải sau thời gian gia nhập' } });
}

export const getPerson = (ctx: Ctx, orgId: string, id: string) => getContent(ctx, PERSON_KIND, orgId, id);
export type PersonDto = Awaited<ReturnType<typeof getPerson>>;

export async function createPerson(ctx: Ctx, orgId: string, raw: PersonInput | unknown) {
  const input = parse(personInput, raw);
  checkDates(input.joinedDate, input.leftDate);
  await checkImage(ctx.db, orgId, input.avatarMediaId, 'avatarMediaId');
  return insertContent(ctx, PERSON_KIND, orgId, input, {
    fullName: input.fullName,
    roleTitleVi: input.roleTitleVi,
    roleTitleEn: input.roleTitleEn,
    isFounder: input.isFounder,
    joinedDate: input.joinedDate?.date ?? null,
    joinedDatePrecision: input.joinedDate?.precision ?? null,
    leftDate: input.leftDate?.date ?? null,
    leftDatePrecision: input.leftDate?.precision ?? null,
    bioVi: cleanHtml(input.bioVi),
    bioEn: cleanHtml(input.bioEn),
    contributionsVi: cleanHtml(input.contributionsVi),
    contributionsEn: cleanHtml(input.contributionsEn),
    avatarMediaId: input.avatarMediaId ?? null,
  });
}

export async function updatePerson(ctx: Ctx, orgId: string, id: string, raw: unknown) {
  const { version, ...patch } = parse(personPatch, raw);
  return patchContent<PersonRow, ReturnType<typeof PERSON_KIND.fields>>(ctx, PERSON_KIND, orgId, id, version, async (p, tx) => {
    const joined = patch.joinedDate === undefined ? fuzzy(p.joinedDate, p.joinedDatePrecision) : patch.joinedDate;
    const left = patch.leftDate === undefined ? fuzzy(p.leftDate, p.leftDatePrecision) : patch.leftDate;
    checkDates(joined, left);
    await checkImage(tx, orgId, patch.avatarMediaId, 'avatarMediaId');
    const set: Partial<typeof t.people.$inferInsert> = {};
    if (patch.fullName !== undefined) set.fullName = patch.fullName;
    if (patch.roleTitleVi !== undefined) set.roleTitleVi = patch.roleTitleVi;
    if (patch.roleTitleEn !== undefined) set.roleTitleEn = patch.roleTitleEn;
    if (patch.isFounder !== undefined) set.isFounder = patch.isFounder;
    if (patch.joinedDate !== undefined) Object.assign(set, { joinedDate: patch.joinedDate?.date ?? null, joinedDatePrecision: patch.joinedDate?.precision ?? null });
    if (patch.leftDate !== undefined) Object.assign(set, { leftDate: patch.leftDate?.date ?? null, leftDatePrecision: patch.leftDate?.precision ?? null });
    if (patch.bioVi !== undefined) set.bioVi = cleanHtml(patch.bioVi);
    if (patch.bioEn !== undefined) set.bioEn = cleanHtml(patch.bioEn);
    if (patch.contributionsVi !== undefined) set.contributionsVi = cleanHtml(patch.contributionsVi);
    if (patch.contributionsEn !== undefined) set.contributionsEn = cleanHtml(patch.contributionsEn);
    if (patch.avatarMediaId !== undefined) set.avatarMediaId = patch.avatarMediaId;
    if (patch.internalNotes !== undefined) set.internalNotes = patch.internalNotes;
    return set;
  });
}

export const deletePerson = (ctx: Ctx, orgId: string, id: string) => deleteContent(ctx, PERSON_KIND, orgId, id);
export const listPeople = (ctx: Ctx, orgId: string, query: ContentListQuery = {}) => listContent(ctx, PERSON_KIND, orgId, query);
