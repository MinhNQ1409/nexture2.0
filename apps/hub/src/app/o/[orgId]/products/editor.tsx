'use client';
// Product / project create/detail (06 §7).
import { PP_KIND_LABELS, PP_KINDS, PP_STATUS_LABELS, PP_STATUSES, formatFuzzyDate, type PpKind, type PpStatus } from '@nexture/contracts';
import type { ProductDto } from '@nexture/core';
import { CoverField } from '@/components/media-picker';
import { ContentEditor, Html, InternalNotesField, type ContentBase } from '@/components/content-editor';
import { OptionalDate, thisYear, type FuzzyValue } from '@/components/fuzzy-date';
import { Field, Input, Select, Textarea } from '@/components/ui';
import { htmlToText, textToHtml } from '@/lib/plain-html';

type Pr = ProductDto & ContentBase;
type Form = { kind: PpKind; titleVi: string; summaryVi: string; hasLaunch: boolean; launchDate: FuzzyValue; ppStatus: PpStatus; description: string; internalNotes: string; cover: string | null };

const toForm = (p: Pr | null, kind: PpKind = 'PRODUCT'): Form => ({
  kind: p?.kind ?? kind,
  titleVi: p?.titleVi ?? '',
  summaryVi: p?.summaryVi ?? '',
  hasLaunch: Boolean(p?.launchDate),
  launchDate: p?.launchDate ?? thisYear(),
  ppStatus: p?.ppStatus ?? 'ACTIVE',
  description: htmlToText(p?.descriptionVi ?? null),
  internalNotes: p?.internalNotes ?? '',
  cover: p?.cover?.id ?? null,
});

export function ProductEditor({ orgId, isAdmin, product, kind }: { orgId: string; isAdmin: boolean; product: Pr | null; kind?: PpKind }) {
  return (
    <ContentEditor<Pr, Form>
      orgId={orgId}
      isAdmin={isAdmin}
      collection="products"
      noun="sản phẩm hoặc dự án"
      listLabel="Sản phẩm & Dự án"
      entity={product}
      title={(p) => p.titleVi}
      toForm={(p) => toForm(p, kind)}
      canSave={(f) => Boolean(f.titleVi.trim())}
      payload={(f) => ({
        kind: f.kind,
        titleVi: f.titleVi,
        summaryVi: f.summaryVi || null,
        launchDate: f.hasLaunch ? f.launchDate : null,
        ppStatus: f.ppStatus,
        descriptionVi: textToHtml(f.description) || null,
        internalNotes: f.internalNotes || null,
        coverMediaId: f.cover,
      })}
      fields={(form, set, err) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
            <Field label="Loại *">
              <Select value={form.kind} onChange={(e) => set('kind', e.target.value as PpKind)}>
                {PP_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {PP_KIND_LABELS[k]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tên *" error={err('titleVi')}>
              <Input value={form.titleVi} maxLength={200} onChange={(e) => set('titleVi', e.target.value)} />
            </Field>
          </div>
          <Field label={`Tóm tắt (${form.summaryVi.length}/500)`} hint="Cần có trước khi gửi duyệt." error={err('summaryVi')}>
            <Textarea rows={2} maxLength={500} value={form.summaryVi} onChange={(e) => set('summaryVi', e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <OptionalDate
              label={form.kind === 'PRODUCT' ? 'Có ngày ra mắt' : 'Có ngày khởi động'}
              on={form.hasLaunch}
              value={form.launchDate}
              onToggle={(v) => set('hasLaunch', v)}
              onChange={(v) => set('launchDate', v)}
            />
            <Field label="Tình trạng">
              <Select value={form.ppStatus} onChange={(e) => set('ppStatus', e.target.value as PpStatus)}>
                {PP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PP_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Mô tả" hint="Xuống dòng hai lần để tách đoạn.">
            <Textarea rows={8} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <CoverField orgId={orgId} label="Ảnh bìa" value={form.cover} initial={product?.cover ?? null} onChange={(id) => set('cover', id)} />
          <InternalNotesField value={form.internalNotes} onChange={(v) => set('internalNotes', v)} />
        </>
      )}
      read={(p) => (
        <>
          <p className="text-caption text-ink-mute">
            {[PP_KIND_LABELS[p.kind], PP_STATUS_LABELS[p.ppStatus], p.launchDate && formatFuzzyDate(p.launchDate)].filter(Boolean).join(' · ')}
          </p>
          {p.summaryVi && <p className="text-body-lg">{p.summaryVi}</p>}
          <Html html={p.descriptionVi} />
        </>
      )}
    />
  );
}
