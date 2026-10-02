'use client';
// English version of an item (bilingual Atlas): optional; each empty field falls back to Vietnamese on Atlas.
import { Languages } from 'lucide-react';
import { RichText } from './rich-text';
import { Field, Input, Textarea } from './ui';

export type EnSpec = { key: string; label: string; kind: 'input' | 'textarea' | 'rich'; max?: number };
export type EnForm = Record<string, string>;

export const enForm = (entity: Record<string, unknown> | null, spec: EnSpec[]): EnForm =>
  Object.fromEntries(spec.map((f) => [f.key, (entity?.[f.key] as string | null | undefined) ?? '']));
export const enPayload = (en: EnForm) => Object.fromEntries(Object.entries(en).map(([k, v]) => [k, v.trim() ? v : null]));

export function EnglishFields({ spec, value, onChange }: { spec: EnSpec[]; value: EnForm; onChange: (v: EnForm) => void }) {
  const filled = spec.filter((f) => value[f.key]?.trim()).length;
  return (
    <details className="group rounded-md border border-hairline" open={filled > 0}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold">
        <Languages size={18} strokeWidth={1.5} aria-hidden className="text-primary" />
        Bản tiếng Anh cho Atlas
        <span className="text-caption font-normal text-ink-mute">
          {filled ? `${filled}/${spec.length} mục` : 'Không bắt buộc. Trường để trống sẽ hiện tiếng Việt.'}
        </span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-hairline p-4">
        {spec.map((f) => {
          const set = (v: string) => onChange({ ...value, [f.key]: v });
          const v = value[f.key] ?? '';
          if (f.kind === 'rich') return <RichText key={f.key} label={f.label} minRows={6} value={v} onChange={set} />;
          return (
            <Field key={f.key} label={f.max ? `${f.label} (${v.length}/${f.max})` : f.label}>
              {f.kind === 'textarea' ? <Textarea rows={2} maxLength={f.max} value={v} onChange={(e) => set(e.target.value)} /> : <Input maxLength={f.max} value={v} onChange={(e) => set(e.target.value)} />}
            </Field>
          );
        })}
      </div>
    </details>
  );
}
