// docs/spec/02-database-ghi-chu.md §9
import slugify from 'slugify';

const MAX = 80;

export function makeSlug(text: string): string {
  let s = slugify(text.replace(/đ/g, 'd').replace(/Đ/g, 'D'), { locale: 'vi', lower: true, strict: true, trim: true });
  if (s.length > MAX) {
    const cut = s.lastIndexOf('-', MAX);
    s = cut > 0 ? s.slice(0, cut) : s.slice(0, MAX);
  }
  return s || 'noi-dung';
}

/** First free candidate among base, base-2, base-3, ... */
export async function uniqueSlug(base: string, isTaken: (s: string) => Promise<boolean>): Promise<string> {
  if (!(await isTaken(base))) return base;
  for (let i = 2; ; i++) {
    const suffix = `-${i}`;
    const candidate = `${base.slice(0, MAX - suffix.length)}${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }
}
