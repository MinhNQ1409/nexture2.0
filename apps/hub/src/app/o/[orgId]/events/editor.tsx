'use client';
// Event create/detail (06 §7).
import { EVENT_TYPE_LABELS, EVENT_TYPES, type EventType } from '@nexture/contracts';
import type { EventDto } from '@nexture/core';
import { CoverField } from '@/components/media-picker';
import { ContentEditor, Html, InternalNotesField, type ContentBase } from '@/components/content-editor';
import { FuzzyDateInput, OptionalDate, thisYear, type FuzzyValue } from '@/components/fuzzy-date';
import { Field, Input, Select, Textarea } from '@/components/ui';
import { RichText } from '@/components/rich-text';

type Ev = EventDto & ContentBase;
type Form = { eventType: EventType; titleVi: string; startDate: FuzzyValue; hasEnd: boolean; endDate: FuzzyValue; summaryVi: string; content: string; internalNotes: string; cover: string | null };

const toForm = (e: Ev | null): Form => ({
  eventType: e?.eventType ?? 'MILESTONE',
  titleVi: e?.titleVi ?? '',
  startDate: e?.startDate ?? thisYear(),
  hasEnd: Boolean(e?.endDate),
  endDate: e?.endDate ?? thisYear(),
  summaryVi: e?.summaryVi ?? '',
  content: e?.contentVi ?? '',
  internalNotes: e?.internalNotes ?? '',
  cover: e?.cover?.id ?? null,
});

export function EventEditor({ orgId, isAdmin, event }: { orgId: string; isAdmin: boolean; event: Ev | null }) {
  return (
    <ContentEditor<Ev, Form>
      orgId={orgId}
      isAdmin={isAdmin}
      collection="events"
      noun="sự kiện"
      listLabel="Sự kiện"
      entity={event}
      title={(e) => e.titleVi}
      toForm={toForm}
      canSave={(f) => Boolean(f.titleVi.trim())}
      payload={(f) => ({
        eventType: f.eventType,
        titleVi: f.titleVi,
        startDate: f.startDate,
        endDate: f.hasEnd ? f.endDate : null,
        summaryVi: f.summaryVi || null,
        contentVi: f.content || null,
        internalNotes: f.internalNotes || null,
        coverMediaId: f.cover,
      })}
      fields={(form, set, err) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
            <Field label="Loại sự kiện">
              <Select value={form.eventType} onChange={(e) => set('eventType', e.target.value as EventType)}>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tiêu đề *" error={err('titleVi')}>
              <Input value={form.titleVi} maxLength={200} onChange={(e) => set('titleVi', e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ngày bắt đầu *" error={err('startDate')}>
              <FuzzyDateInput value={form.startDate} onChange={(v) => set('startDate', v)} />
            </Field>
            <OptionalDate label="Sự kiện kéo dài" on={form.hasEnd} value={form.endDate} onToggle={(v) => set('hasEnd', v)} onChange={(v) => set('endDate', v)} error={err('endDate')} />
          </div>
          <Field label={`Tóm tắt (${form.summaryVi.length}/500)`} error={err('summaryVi')}>
            <Textarea rows={2} maxLength={500} value={form.summaryVi} onChange={(e) => set('summaryVi', e.target.value)} />
          </Field>
          <RichText label="Nội dung" value={form.content} onChange={(v) => set('content', v)} />
          <CoverField orgId={orgId} label="Ảnh bìa" value={form.cover} initial={event?.cover ?? null} onChange={(id) => set('cover', id)} />
          <InternalNotesField value={form.internalNotes} onChange={(v) => set('internalNotes', v)} />
        </>
      )}
      read={(e) => (
        <>
          <p className="text-caption text-ink-mute">{EVENT_TYPE_LABELS[e.eventType]}</p>
          {e.summaryVi && <p className="text-body-lg">{e.summaryVi}</p>}
          <Html html={e.contentVi} />
        </>
      )}
    />
  );
}
