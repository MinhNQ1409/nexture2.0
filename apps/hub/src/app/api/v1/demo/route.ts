import { createCorpDemos, createDemoOrg } from '@nexture/core';
import { route } from '@/lib/api';
import { attachDemoEditors } from '@/lib/demo-accounts';

// Body { set: 'corps' } loads Vinamilk, FPT and Vingroup ({ only: ['vinamilk'] } picks some), each with an editor
// login {key}@gmail.com / 12345678; no body loads the Mây Ngàn sample.
export const POST = route(
  async ({ ctx, req }) => {
    const body = (await req.json().catch(() => null)) as { set?: string; only?: unknown } | null;
    if (body?.set !== 'corps') return createDemoOrg(ctx);
    const only = Array.isArray(body.only) ? body.only.filter((k): k is string => typeof k === 'string') : undefined;
    const r = await createCorpDemos(ctx, only);
    return { ...r, editors: await attachDemoEditors(ctx, r.corps) };
  },
  { status: 201 },
);

export const maxDuration = 120;
