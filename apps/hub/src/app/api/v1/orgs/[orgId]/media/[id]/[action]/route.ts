// Media workflow (04 §1, §3) and the upload fallback through the Hub.
import { AppError, mediaTransition, setMediaVisibility, uploadThroughHub } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; id: string; action: string };

export const POST = route<P>(async ({ req, ctx, params }) => {
  if (params.action === 'upload') return uploadThroughHub(ctx, params.orgId, params.id, new Uint8Array(await req.arrayBuffer()));
  return mediaTransition(ctx, params.orgId, params.id, params.action, await body(req));
});

export const PUT = route<P>(async ({ req, ctx, params }) => {
  if (params.action !== 'visibility') throw new AppError('NOT_FOUND');
  return setMediaVisibility(ctx, params.orgId, params.id, await body(req));
});
