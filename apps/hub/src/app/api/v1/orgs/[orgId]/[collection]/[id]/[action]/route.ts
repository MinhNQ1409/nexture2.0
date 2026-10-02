// Workflow for stories | events | people | products | media (05-api.yaml "workflow").
import { AppError, publicPreview, setEntityMedia, setRelations, setVisibility, transition, type TransitionName } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; collection: string; id: string; action: string };
const TRANSITIONS = ['submit', 'withdraw', 'approve', 'return', 'unverify'];

export const POST = route<P>(async ({ req, ctx, params }) => {
  if (!TRANSITIONS.includes(params.action)) throw new AppError('NOT_FOUND');
  return transition(ctx, params.collection, params.orgId, params.id, params.action as TransitionName, await body(req));
});

export const PUT = route<P>(async ({ req, ctx, params }) => {
  if (params.action === 'media') return setEntityMedia(ctx, params.collection, params.orgId, params.id, await body(req));
  if (params.action === 'relations') return setRelations(ctx, params.collection, params.orgId, params.id, await body(req));
  if (params.action !== 'visibility') throw new AppError('NOT_FOUND');
  return setVisibility(ctx, params.collection, params.orgId, params.id, await body(req));
});

export const GET = route<P>(({ ctx, params }) => {
  if (params.action !== 'public-preview') throw new AppError('NOT_FOUND');
  return publicPreview(ctx, params.collection, params.orgId, params.id);
});
