import { createCorpDemos, createDemoOrg } from '@nexture/core';
import { route } from '@/lib/api';

// Body { set: 'corps' } loads Vinamilk, FPT and Vingroup ({ only: ['vinamilk'] } picks some); no body loads the Mây Ngàn sample.
export const POST = route(
  async ({ ctx, req }) => {
    const body = (await req.json().catch(() => null)) as { set?: string; only?: unknown } | null;
    const only = Array.isArray(body?.only) ? body.only.filter((k): k is string => typeof k === 'string') : undefined;
    return body?.set === 'corps' ? createCorpDemos(ctx, only) : createDemoOrg(ctx);
  },
  { status: 201 },
);

export const maxDuration = 120;
