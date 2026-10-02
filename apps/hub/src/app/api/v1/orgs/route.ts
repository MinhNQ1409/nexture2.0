import type { CreateOrgInput } from '@nexture/contracts';
import { createOrg } from '@nexture/core';
import { body, route } from '@/lib/api';

export const POST = route(async ({ req, ctx }) => createOrg(ctx, (await body(req)) as CreateOrgInput), { status: 201 });
