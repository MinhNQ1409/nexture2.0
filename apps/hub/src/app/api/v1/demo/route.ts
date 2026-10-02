import { createDemoOrg } from '@nexture/core';
import { route } from '@/lib/api';

export const POST = route(async ({ ctx }) => createDemoOrg(ctx), { status: 201 });
