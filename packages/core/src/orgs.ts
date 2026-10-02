// Organizations: docs/spec/02-database-ghi-chu.md §2, 04-trang-thai.md §5, 05-api.yaml /orgs.
import { and, count, eq, inArray, isNull, ne, sql } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { coreTables as t } from '@nexture/db';
import { createOrgInput, updateOrgInput, type CreateOrgInput, type OrgRole, type UpdateOrgInput } from '@nexture/contracts';
import { diff, logActivity } from './activity';
import { canOrg, orgPermissions } from './authz';
import { requireMember, type Ctx, type DbOrTx } from './context';
import { fail } from './errors';
import { makeSlug, uniqueSlug } from './slug';
import { parse } from './validate';

type OrgRow = typeof t.organizations.$inferSelect;

/** Fields that must be filled before the org can be shown on Atlas (02-database-ghi-chu §2). */
export const ATLAS_REQUIRED_FIELDS = ['name', 'logoMediaId', 'foundedYear', 'industryCode', 'provinceCode', 'shortDescVi'] as const;

export async function missingAtlasFields(db: DbOrTx, org: Pick<OrgRow, (typeof ATLAS_REQUIRED_FIELDS)[number] | 'id'>) {
  const missing: string[] = ATLAS_REQUIRED_FIELDS.filter((f) => org[f] === null || org[f] === undefined || org[f] === '');
  if (org.logoMediaId && !missing.includes('logoMediaId')) {
    const [logo] = await db
      .select({ id: t.mediaAssets.id })
      .from(t.mediaAssets)
      .where(
        and(
          eq(t.mediaAssets.id, org.logoMediaId),
          eq(t.mediaAssets.organizationId, org.id),
          eq(t.mediaAssets.uploadStatus, 'READY'),
          eq(t.mediaAssets.kind, 'IMAGE'),
          isNull(t.mediaAssets.deletedAt),
        ),
      );
    if (!logo) missing.push('logoMediaId');
  }
  return missing;
}

async function slugTaken(db: DbOrTx, slug: string, exceptOrgId?: string) {
  const [row] = await db
    .select({ id: t.organizations.id })
    .from(t.organizations)
    .where(exceptOrgId ? and(eq(t.organizations.slug, slug), ne(t.organizations.id, exceptOrgId)) : eq(t.organizations.slug, slug));
  return Boolean(row);
}

export async function slugAvailability(db: DbOrTx, slug: string) {
  const base = makeSlug(slug);
  const available = base === slug && !(await slugTaken(db, slug));
  return { available, suggestion: available ? slug : await uniqueSlug(base, (s) => slugTaken(db, s)) };
}

async function onboarding(db: DbOrTx, orgId: string) {
  const one = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0;
  // Sequential: a transaction holds one connection and pg disallows concurrent queries on it.
  const founders = await one(db.select({ n: count() }).from(t.people).where(and(eq(t.people.organizationId, orgId), eq(t.people.isFounder, true), isNull(t.people.deletedAt))));
  const others = await one(db.select({ n: count() }).from(t.people).where(and(eq(t.people.organizationId, orgId), eq(t.people.isFounder, false), isNull(t.people.deletedAt))));
  const events = await one(db.select({ n: count() }).from(t.events).where(and(eq(t.events.organizationId, orgId), isNull(t.events.deletedAt))));
  const stories = await one(
    db
      .select({ n: count() })
      .from(t.stories)
      .where(and(eq(t.stories.organizationId, orgId), inArray(t.stories.storyType, ['CULTURE', 'FOUNDER', 'COMPANY']), isNull(t.stories.deletedAt))),
  );
  const products = await one(db.select({ n: count() }).from(t.productsProjects).where(and(eq(t.productsProjects.organizationId, orgId), isNull(t.productsProjects.deletedAt))));
  return { hasFounder: founders >= 1, hasEvents: events >= 3, hasPeople: others >= 1, hasCultureStory: stories >= 1, hasProduct: products >= 1 };
}

function atlasUrl(org: OrgRow): string | null {
  if (!org.atlasEnabled || org.atlasHiddenAt) return null;
  const base = process.env.ATLAS_BASE_URL;
  return base ? `${base.replace(/\/$/, '')}/companies/${org.slug}` : null;
}

async function toDto(db: DbOrTx, org: OrgRow, role: OrgRole) {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    slugLocked: org.slugLocked,
    logoMediaId: org.logoMediaId,
    logo: org.logoMediaId ? { id: org.logoMediaId } : null,
    foundedYear: org.foundedYear,
    industryCode: org.industryCode,
    employeeSize: org.employeeSize,
    provinceCode: org.provinceCode,
    website: org.website,
    shortDescVi: org.shortDescVi,
    shortDescEn: org.shortDescEn,
    featuredStoryId: org.featuredStoryId,
    atlasEnabled: org.atlasEnabled,
    atlasHiddenReason: org.atlasHiddenReason,
    atlasUrl: atlasUrl(org),
    version: org.version,
    myRole: role,
    permissions: orgPermissions(role),
    onboarding: await onboarding(db, org.id),
  };
}
export type OrganizationDto = Awaited<ReturnType<typeof toDto>>;

/** POST /orgs — caller becomes ADMIN; founders become VERIFIED people, values become culture_values. */
export async function createOrg(ctx: Ctx, raw: CreateOrgInput): Promise<OrganizationDto> {
  const input = parse(createOrgInput, raw);
  const { userId } = ctx.actor;
  return ctx.db.transaction(async (tx) => {
    let slug: string;
    if (input.slug) {
      if (await slugTaken(tx, input.slug)) fail('SLUG_TAKEN');
      slug = input.slug;
    } else {
      slug = await uniqueSlug(makeSlug(input.name), (s) => slugTaken(tx, s));
    }
    if (input.logoMediaId || input.featuredStoryId) fail('VALIDATION_FAILED', { fields: ['logoMediaId', 'featuredStoryId'].filter((f) => f in raw) });

    const id = uuidv7();
    const [org] = await tx
      .insert(t.organizations)
      .values({
        id,
        name: input.name,
        slug,
        foundedYear: input.foundedYear ?? null,
        industryCode: input.industryCode ?? null,
        employeeSize: (input.employeeSize ?? null) as OrgRow['employeeSize'],
        provinceCode: input.provinceCode ?? null,
        website: input.website,
        shortDescVi: input.shortDescVi,
        shortDescEn: input.shortDescEn,
        createdBy: userId,
      })
      .returning();
    await tx.insert(t.organizationMembers).values({ organizationId: id, userId, role: 'ADMIN' });

    const now = new Date();
    for (const fullName of input.founderNames) {
      await tx.insert(t.people).values({
        id: uuidv7(),
        organizationId: id,
        fullName,
        isFounder: true,
        status: 'VERIFIED',
        verifiedBy: userId,
        verifiedAt: now,
        createdBy: userId,
        updatedBy: userId,
      });
    }
    for (const [i, v] of input.values.entries()) {
      await tx.insert(t.cultureValues).values({
        id: uuidv7(),
        organizationId: id,
        nameVi: v.nameVi,
        descriptionVi: v.descriptionVi,
        sortOrder: i,
        createdBy: userId,
        updatedBy: userId,
      });
    }
    await logActivity(tx, { organizationId: id, actorId: userId, action: 'ORG_CREATED', targetType: 'ORGANIZATION', targetId: id, targetLabel: input.name });
    return toDto(tx, org!, 'ADMIN');
  });
}

export async function getOrg(ctx: Ctx, orgId: string): Promise<OrganizationDto> {
  const role = await requireMember(ctx.db, ctx.actor, orgId);
  const [org] = await ctx.db.select().from(t.organizations).where(eq(t.organizations.id, orgId));
  if (!org) return fail('NOT_FOUND');
  return toDto(ctx.db, org, role);
}

/** PATCH /orgs/{orgId} (ADMIN). Atlas sync of the profile is wired in with syncPublic (step 3). */
export async function updateOrg(ctx: Ctx, orgId: string, raw: UpdateOrgInput): Promise<OrganizationDto> {
  const { version, ...patch } = parse(updateOrgInput, raw);
  return ctx.db.transaction(async (tx) => {
    const role = await requireMember(tx, ctx.actor, orgId);
    if (!canOrg(role, 'org.edit')) fail('FORBIDDEN');
    const [org] = await tx.select().from(t.organizations).where(eq(t.organizations.id, orgId)).for('update');
    if (!org) return fail('NOT_FOUND');
    if (org.version !== version) fail('VERSION_CONFLICT');

    if (patch.slug !== undefined && patch.slug !== org.slug) {
      if (org.slugLocked) fail('SLUG_LOCKED');
      if (await slugTaken(tx, patch.slug, orgId)) fail('SLUG_TAKEN');
    }
    if (patch.logoMediaId) {
      const [m] = await tx
        .select({ id: t.mediaAssets.id })
        .from(t.mediaAssets)
        .where(and(eq(t.mediaAssets.id, patch.logoMediaId), eq(t.mediaAssets.organizationId, orgId), eq(t.mediaAssets.kind, 'IMAGE'), isNull(t.mediaAssets.deletedAt)));
      if (!m) fail('MEDIA_KIND_INVALID');
    }
    if (patch.featuredStoryId) {
      const [s] = await tx
        .select({ id: t.stories.id })
        .from(t.stories)
        .where(and(eq(t.stories.id, patch.featuredStoryId), eq(t.stories.organizationId, orgId), eq(t.stories.storyType, 'COMPANY'), isNull(t.stories.deletedAt)));
      if (!s) fail('FEATURED_STORY_INVALID');
    }

    const next = { ...org, ...stripUndefined(patch) } as OrgRow;
    if (org.atlasEnabled) {
      const missing = await missingAtlasFields(tx, next);
      if (missing.length) fail('ATLAS_PROFILE_INCOMPLETE', { fields: missing });
    }

    const changes = diff(org as unknown as Record<string, unknown>, stripUndefined(patch));
    const [updated] = await tx
      .update(t.organizations)
      .set({ ...stripUndefined(patch), employeeSize: next.employeeSize, version: sql`${t.organizations.version} + 1`, updatedAt: new Date() })
      .where(eq(t.organizations.id, orgId))
      .returning();
    if (Object.keys(changes).length) {
      await logActivity(tx, { organizationId: orgId, actorId: ctx.actor.userId, action: 'ORG_UPDATED', targetType: 'ORGANIZATION', targetId: orgId, targetLabel: updated!.name, changes });
    }
    return toDto(tx, updated!, role);
  });
}

function stripUndefined<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}
