import { formatFuzzyDate, type DatePrecision } from '@nexture/contracts';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function one(date: string, precision: string | null, lang: 'vi' | 'en') {
  const p = (precision ?? 'DAY') as DatePrecision;
  if (lang === 'vi') return formatFuzzyDate({ date, precision: p });
  const [y, m, d] = date.split('-');
  const mon = MONTHS_EN[Number(m) - 1];
  return p === 'YEAR' ? y : p === 'MONTH' ? `${mon} ${y}` : `${Number(d)} ${mon} ${y}`;
}

export function eventDate(date: string | null, precision: string | null, end?: string | null, endPrecision?: string | null, lang: 'vi' | 'en' = 'vi') {
  if (!date) return '';
  const start = one(date, precision, lang);
  if (!end) return start;
  return `${start} – ${one(end, endPrecision ?? null, lang)}`;
}
