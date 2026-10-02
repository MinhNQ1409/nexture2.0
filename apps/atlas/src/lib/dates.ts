import { formatFuzzyDate, type DatePrecision } from '@nexture/contracts';

export function eventDate(date: string | null, precision: string | null, end?: string | null, endPrecision?: string | null) {
  if (!date) return '';
  const start = formatFuzzyDate({ date, precision: (precision ?? 'DAY') as DatePrecision });
  if (!end) return start;
  return `${start} – ${formatFuzzyDate({ date: end, precision: (endPrecision ?? 'DAY') as DatePrecision })}`;
}
