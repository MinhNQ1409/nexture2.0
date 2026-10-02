// Media upload (3 steps): docs/spec/05-api-ghi-chu.md §5, 02-database-ghi-chu.md §7.
import { and, eq, isNull } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { coreTables as t } from '@nexture/db';
import { completeUploadInput, MEDIA_RULES, uploadUrlInput, type MediaKind } from '@nexture/contracts';
import { logActivity } from './activity';
import { canOrg } from './authz';
import { requireMember, requireStorage, type Ctx } from './context';
import { fail } from './errors';
import { makeSlug } from './slug';
import { parse } from './validate';

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
