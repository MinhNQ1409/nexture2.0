import { createCorpDemos, createDemoOrg } from '@nexture/core';
import { route } from '@/lib/api';

// Body { set: 'corps' } loads Vinamilk, FPT and Vingroup; no body loads the Mây Ngàn sample.
export const POST = route(
  async ({ ctx, req }) => {
    const body = (await req.json().catch(() => null)) as { set?: string } | null;
    return body?.set === 'corps' ? createCorpDemos(ctx) : createDemoOrg(ctx);
  },
  { status: 201 },
);

export const maxDuration = 120;
