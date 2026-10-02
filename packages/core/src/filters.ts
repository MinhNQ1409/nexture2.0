import { sql, type AnyColumn, type SQL } from 'drizzle-orm';

/** Year range filter on a date column; rows without a date drop out once a bound is set. */
export function yearConds(col: SQL | AnyColumn, from: unknown, to: unknown): SQL[] {
  const year = (v: unknown) => (/^\d{4}$/.test(String(v ?? '')) ? Number(v) : null);
  const f = year(from);
  const until = year(to);
  const out: SQL[] = [];
  if (f !== null) out.push(sql`extract(year from ${col}) >= ${f}`);
  if (until !== null) out.push(sql`extract(year from ${col}) <= ${until}`);
  return out;
}
