import type { z } from 'zod';
import { fail } from './errors';

/** Parses input with a contracts schema; 422 VALIDATION_FAILED with per-field messages on error. */
export function parse<S extends z.ZodType>(schema: S, raw: unknown): z.output<S> {
  const r = schema.safeParse(raw);
  if (r.success) return r.data;
  const fields: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const key = issue.path.join('.') || '_';
    fields[key] ??= issue.message;
  }
  return fail('VALIDATION_FAILED', { fields });
}
