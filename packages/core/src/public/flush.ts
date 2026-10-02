// After commit: tell Atlas which cache tags changed and delete public files no longer used (08 §4, §8).
import type { Ctx } from '../context';
import type { SyncResult } from './sync';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function flushRevalidate(ctx: Ctx, result: SyncResult): Promise<void> {
  for (const key of result.deletePublicKeys) {
    await ctx.storage?.deletePublic(key).catch((e) => console.error('[atlas] delete public file failed', key, e));
  }
  if (!ctx.atlas || result.tags.size === 0) return;
  const body = JSON.stringify({ tags: [...result.tags].slice(0, 200) });
  for (const delay of [0, 500, 1500]) {
    if (delay) await wait(delay);
    try {
      const res = await fetch(`${ctx.atlas.baseUrl.replace(/\/$/, '')}/api/revalidate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidate-secret': ctx.atlas.secret },
        body,
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) return;
    } catch {
      // retry
    }
  }
  console.error('[atlas] revalidate failed; pages refresh within 5 minutes');
}
