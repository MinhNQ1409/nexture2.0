// "Tải dữ liệu 3 tập đoàn": Vinamilk, FPT and Vingroup as live Atlas profiles, bilingual, every public item verified
// and cited. Names carry "(Demo)" and logos are generated monograms, so nobody mistakes them for official pages.
import { eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import type { EventType } from '@nexture/contracts';
import { coreTables as t } from '@nexture/db';
import { logActivity } from './activity';
import type { Ctx } from './context';
import { CORPS } from './demo-corps-data';
import { logoSvg } from './demo';
import { flushRevalidate } from './public/flush';
import { emptySync, syncPublic } from './public/sync';
import { makeSlug, uniqueSlug } from './slug';

type Precision = 'YEAR' | 'MONTH' | 'DAY';
type When = [string, Precision] | null;
type Source = { title: string; url?: string; note?: string };
export type CorpDemo = {
  key: string;
  name: string;
  foundedYear: number;
  industryCode: string;
  employeeSize: 'S1_10' | 'S11_50' | 'S51_200' | 'S201_500' | 'S500_PLUS';
  provinceCode: string;
  website: string;
  shortDescVi: string;
  shortDescEn: string;
  values: { nameVi: string; nameEn: string; descVi: string; descEn: string }[];
  people: { key: string; fullName: string; roleVi: string; roleEn: string; isFounder: boolean; joined: When; bioVi: string | null; bioEn: string | null; sources: Source[] }[];
  products: { key: string; kind: 'PRODUCT' | 'PROJECT'; titleVi: string; titleEn: string; summaryVi: string; summaryEn: string; launch: When; ppStatus: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED'; descriptionVi: string | null; descriptionEn: string | null; sources: Source[] }[];
  stories: { key: string; type: 'COMPANY' | 'FOUNDER' | 'CULTURE' | 'PEOPLE' | 'PRODUCT'; titleVi: string; titleEn: string; summaryVi: string; summaryEn: string; date: When; contentVi: string | null; contentEn: string | null; sources: Source[] }[];
  events: { type: string; titleVi: string; titleEn: string; start: [string, Precision]; end: When; summaryVi: string; summaryEn: string; contentVi: string | null; contentEn: string | null; people: string[]; products: string[]; values: string[]; sources: Source[] }[];
};

const LOGO: Record<string, { initials: string; fill: string; line: string }> = {
  vinamilk: { initials: 'VNM', fill: '#0B3B8C', line: '#CFE0FF' },
  fpt: { initials: 'FPT', fill: '#E8590C', line: '#FFE3CC' },
  vingroup: { initials: 'VIC', fill: '#8A1538', line: '#F6D5DF' },
};

async function createCorp(ctx: Ctx, c: CorpDemo): Promise<string> {
  const userId = ctx.actor.userId;
  const orgId = uuidv7();
  const logoId = uuidv7();
  const logoKey = `orgs/${orgId}/media/${logoId}/logo-${c.key}.svg`;
  const l = LOGO[c.key] ?? { initials: c.name.slice(0, 2).toUpperCase(), fill: '#8B572A', line: '#F3EAE1' };
  const logo = logoSvg(l.initials, l.fill, l.line);
  if (ctx.storage) await ctx.storage.putPrivate(logoKey, logo, 'image/svg+xml');
  const label = `${c.name} (Demo)`;
  const sync = emptySync();

  await ctx.db.transaction(async (tx) => {
    const taken = async (s: string) => (await tx.select({ id: t.organizations.id }).from(t.organizations).where(eq(t.organizations.slug, s))).length > 0;
    const slug = await uniqueSlug(makeSlug(`${c.name} demo`), taken);
    const now = new Date();
    const who = { createdBy: userId, updatedBy: userId };
    const live = { status: 'VERIFIED' as const, visibility: 'PUBLIC' as const, verifiedBy: userId, verifiedAt: now, ...who };
    const cite = async (entityType: 'EVENT' | 'STORY' | 'PERSON' | 'PRODUCT_PROJECT', entityId: string, sources: Source[]) => {
      for (const [i, s] of sources.entries())
        await tx.insert(t.entitySources).values({ id: uuidv7(), organizationId: orgId, entityType, entityId, title: s.title.slice(0, 300), url: s.url ?? null, note: s.note ?? null, isPublic: true, sortOrder: i, createdBy: userId });
    };

    await tx.insert(t.organizations).values({
      id: orgId, slug, name: label, foundedYear: c.foundedYear, industryCode: c.industryCode, employeeSize: c.employeeSize, provinceCode: c.provinceCode,
      website: c.website, shortDescVi: c.shortDescVi, shortDescEn: c.shortDescEn, createdBy: userId,
    });
    await tx.insert(t.organizationMembers).values({ organizationId: orgId, userId, role: 'ADMIN' });
    await tx.insert(t.mediaAssets).values({
      id: logoId, organizationId: orgId, kind: 'IMAGE', title: `Logo ${label}`, originalFilename: `logo-${c.key}.svg`, mimeType: 'image/svg+xml',
      sizeBytes: logo.byteLength, storageKey: logoKey, uploadStatus: ctx.storage ? 'READY' : 'PENDING', width: 256, height: 256, altText: `Logo minh họa ${label}`, ...who,
    });
    if (ctx.storage) await tx.update(t.organizations).set({ logoMediaId: logoId }).where(eq(t.organizations.id, orgId));

    const valueIds = new Map<string, string>();
    for (const [i, v] of c.values.entries()) {
      const id = uuidv7();
      valueIds.set(v.nameVi, id);
      await tx.insert(t.cultureValues).values({ id, organizationId: orgId, nameVi: v.nameVi, nameEn: v.nameEn, descriptionVi: v.descVi, descriptionEn: v.descEn, sortOrder: i, visibility: 'PUBLIC', ...who });
    }
    const personIds = new Map<string, string>();
    for (const x of c.people) {
      const id = uuidv7();
      personIds.set(x.key, id);
      await tx.insert(t.people).values({
        id, organizationId: orgId, fullName: x.fullName, roleTitleVi: x.roleVi, roleTitleEn: x.roleEn, isFounder: x.isFounder,
        joinedDate: x.joined?.[0] ?? null, joinedDatePrecision: x.joined?.[1] ?? null, bioVi: x.bioVi, bioEn: x.bioEn, ...live,
      });
      await cite('PERSON', id, x.sources);
    }
    const productIds = new Map<string, string>();
    for (const x of c.products) {
      const id = uuidv7();
      productIds.set(x.key, id);
      await tx.insert(t.productsProjects).values({
        id, organizationId: orgId, kind: x.kind, titleVi: x.titleVi, titleEn: x.titleEn, summaryVi: x.summaryVi, summaryEn: x.summaryEn,
        descriptionVi: x.descriptionVi, descriptionEn: x.descriptionEn, launchDate: x.launch?.[0] ?? null, launchDatePrecision: x.launch?.[1] ?? null, ppStatus: x.ppStatus, ...live,
      });
      await cite('PRODUCT_PROJECT', id, x.sources);
    }
    const storyIds: string[] = [];
    for (const x of c.stories) {
      const id = uuidv7();
      storyIds.push(id);
      await tx.insert(t.stories).values({
        id, organizationId: orgId, storyType: x.type, titleVi: x.titleVi, titleEn: x.titleEn, summaryVi: x.summaryVi, summaryEn: x.summaryEn,
        contentVi: x.contentVi, contentEn: x.contentEn, storyDate: x.date?.[0] ?? null, storyDatePrecision: x.date?.[1] ?? null, ...live,
      });
      await cite('STORY', id, x.sources);
      // Founder stories show the founders; culture stories show every value.
      if (x.type === 'FOUNDER')
        for (const p of c.people.filter((p) => p.isFounder))
          await tx.insert(t.relationships).values({ id: uuidv7(), organizationId: orgId, relationshipType: 'PERSON_STORY', sourceType: 'PERSON', sourceId: personIds.get(p.key)!, targetType: 'STORY', targetId: id, createdBy: userId });
      if (x.type === 'CULTURE')
        for (const vid of valueIds.values())
          await tx.insert(t.relationships).values({ id: uuidv7(), organizationId: orgId, relationshipType: 'STORY_CULTURE_VALUE', sourceType: 'STORY', sourceId: id, targetType: 'CULTURE_VALUE', targetId: vid, createdBy: userId });
    }
    const featured = c.stories.findIndex((s) => s.type === 'COMPANY');
    if (featured >= 0) await tx.update(t.organizations).set({ featuredStoryId: storyIds[featured] }).where(eq(t.organizations.id, orgId));

    for (const e of c.events) {
      const id = uuidv7();
      await tx.insert(t.events).values({
        id, organizationId: orgId, eventType: e.type as EventType, titleVi: e.titleVi, titleEn: e.titleEn, summaryVi: e.summaryVi, summaryEn: e.summaryEn,
        contentVi: e.contentVi, contentEn: e.contentEn, startDate: e.start[0], startDatePrecision: e.start[1], endDate: e.end?.[0] ?? null, endDatePrecision: e.end?.[1] ?? null, ...live,
      });
      for (const v of e.values) {
        const vid = valueIds.get(v);
        if (vid) await tx.insert(t.relationships).values({ id: uuidv7(), organizationId: orgId, relationshipType: 'EVENT_CULTURE_VALUE', sourceType: 'EVENT', sourceId: id, targetType: 'CULTURE_VALUE', targetId: vid, createdBy: userId });
      }
      for (const k of e.people) {
        const pid = personIds.get(k);
        if (pid) await tx.insert(t.relationships).values({ id: uuidv7(), organizationId: orgId, relationshipType: 'PERSON_EVENT', sourceType: 'PERSON', sourceId: pid, targetType: 'EVENT', targetId: id, createdBy: userId });
      }
      for (const k of e.products) {
        const pid = productIds.get(k);
        if (pid) await tx.insert(t.relationships).values({ id: uuidv7(), organizationId: orgId, relationshipType: 'EVENT_PRODUCT_PROJECT', sourceType: 'EVENT', sourceId: id, targetType: 'PRODUCT_PROJECT', targetId: pid, createdBy: userId });
      }
      await cite('EVENT', id, e.sources);
    }

    await logActivity(tx, { organizationId: orgId, actorId: userId, action: 'ORG_CREATED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: label });
    if (ctx.storage) {
      await tx.update(t.organizations).set({ atlasEnabled: true, atlasFirstEnabledAt: now, slugLocked: true }).where(eq(t.organizations.id, orgId));
      await logActivity(tx, { organizationId: orgId, actorId: userId, action: 'ATLAS_ENABLED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: label });
      await syncPublic(tx, ctx.storage, { kind: 'org', orgId }, sync);
    }
  });
  await flushRevalidate(ctx, sync);
  return orgId;
}

/** POST /demo { set: 'corps' }: creates the three corporations for the caller (ADMIN of each); returns the first org id. */
export async function createCorpDemos(ctx: Ctx): Promise<{ orgId: string; orgIds: string[] }> {
  const orgIds: string[] = [];
  for (const c of CORPS) orgIds.push(await createCorp(ctx, c));
  return { orgId: orgIds[0]!, orgIds };
}
