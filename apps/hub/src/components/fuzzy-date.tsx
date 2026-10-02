'use client';
// FuzzyDateInput (06 §1): precision select + matching input.
import type { DatePrecision } from '@nexture/contracts';
import { Input, Select } from './ui';

export type FuzzyValue = { date: string; precision: DatePrecision };

export function FuzzyDateInput({ value, onChange, id }: { value: FuzzyValue; onChange: (v: FuzzyValue) => void; id?: string }) {
  const y = value.date.slice(0, 4);
  const ym = value.date.slice(0, 7);
  return (
    <div className="flex gap-2">
      <Select className="w-28 shrink-0" aria-label="Độ chính xác" value={value.precision} onChange={(e) => onChange({ ...value, precision: e.target.value as DatePrecision })}>
        <option value="YEAR">Năm</option>
        <option value="MONTH">Tháng</option>
        <option value="DAY">Ngày</option>
      </Select>
      {value.precision === 'YEAR' && (
        <Input id={id} type="number" min={1800} max={2100} placeholder="2015" value={y === '0000' ? '' : y} onChange={(e) => onChange({ ...value, date: `${e.target.value.padStart(4, '0')}-01-01` })} />
      )}
      {value.precision === 'MONTH' && <Input id={id} type="month" value={ym} onChange={(e) => onChange({ ...value, date: `${e.target.value}-01` })} />}
      {value.precision === 'DAY' && <Input id={id} type="date" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} />}
    </div>
  );
}
