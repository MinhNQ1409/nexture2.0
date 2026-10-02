import { describe, expect, it } from 'vitest';
import { isPublic, publicState } from '../src/public';

describe('isPublic (04 §3)', () => {
  it('is true only when all 5 conditions hold, across all 32 combinations', () => {
    const d = new Date();
    let trueCount = 0;
    for (let mask = 0; mask < 32; mask++) {
      const bit = (i: number) => Boolean(mask & (1 << i));
      const entity = {
        deletedAt: bit(0) ? null : d,
        status: bit(1) ? ('VERIFIED' as const) : ('DRAFT' as const),
        visibility: bit(2) ? ('PUBLIC' as const) : ('INTERNAL' as const),
        atlasHiddenAt: bit(3) ? null : d,
      };
      const org = { atlasEnabled: bit(4), atlasHiddenAt: null };
      const expected = mask === 31;
      expect(isPublic(entity, org)).toBe(expected);
      expect(publicState(entity, org) === 'LIVE').toBe(expected);
      if (expected) trueCount++;
    }
    expect(trueCount).toBe(1);
  });

  it('org hidden by NexTure blocks everything', () => {
    const e = { deletedAt: null, status: 'VERIFIED' as const, visibility: 'PUBLIC' as const, atlasHiddenAt: null };
    expect(isPublic(e, { atlasEnabled: true, atlasHiddenAt: new Date() })).toBe(false);
    expect(publicState(e, { atlasEnabled: true, atlasHiddenAt: new Date() })).toBe('HIDDEN_BY_NEXTURE');
    expect(publicState(e, { atlasEnabled: false, atlasHiddenAt: null })).toBe('WAITING_ORG');
    expect(publicState({ ...e, visibility: 'INTERNAL' }, { atlasEnabled: true, atlasHiddenAt: null })).toBe('NOT_PUBLIC');
  });
});
