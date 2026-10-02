'use client';
// Story create/detail (06 §7).
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { STORY_TYPE_LABELS, STORY_TYPES, type StoryType } from '@nexture/contracts';
import type { StoryDto } from '@nexture/core';
import { CoverField } from '@/components/media-picker';
import { ContentEditor, Html, InternalNotesField, type ContentBase } from '@/components/content-editor';
import { OptionalDate, thisYear, type FuzzyValue } from '@/components/fuzzy-date';
import { Card, Field, Input, Select, Textarea } from '@/components/ui';
import { api } from '@/lib/fetcher';
import { EnglishFields, enForm, enPayload, type EnForm, type EnSpec } from '@/components/english-fields';
import { RichText } from '@/components/rich-text';

type St = StoryDto & ContentBase;
const EN: EnSpec[] = [{ key: 'titleEn', label: 'Title', kind: 'input', max: 200 }, { key: 'summaryEn', label: 'Summary', kind: 'textarea', max: 500 }, { key: 'contentEn', label: 'Content', kind: 'rich' }];
type Form = { storyType: StoryType; titleVi: string; hasDate: boolean; storyDate: FuzzyValue; summaryVi: string; content: string; internalNotes: string; en: EnForm; cover: string | null };

const toForm = (s: St | null, defaultType: StoryType = 'CULTURE'): Form => ({
  storyType: s?.storyType ?? defaultType,
  titleVi: s?.titleVi ?? '',
  hasDate: Boolean(s?.storyDate),
  storyDate: s?.storyDate ?? thisYear(),
  summaryVi: s?.summaryVi ?? '',
  content: s?.contentVi ?? '',
  internalNotes: s?.internalNotes ?? '',
  en: enForm(s as Record<string, unknown> | null, EN),
  cover: s?.cover?.id ?? null,
});

/** 06 §7 item 7: admin picks the COMPANY story shown first on the Atlas profile. */
function FeaturedPanel({ orgId, story, featured }: { orgId: string; story: St; featured: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(featured);
  const [busy, setBusy] = useState(false);
  async function toggle(next: boolean) {
    setBusy(true);
    try {
      const org = await api<{ version: number }>(`/orgs/${orgId}`);
      await api(`/orgs/${orgId}`, { method: 'PATCH', json: { version: org.version, featuredStoryId: next ? story.id : null } });
      setOn(next);
      router.refresh();
    } catch (e) {
      alert((e as { message?: string }).message ?? 'Không lưu được.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="flex flex-col gap-1">
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 size-4 accent-primary" checked={on} disabled={busy} onChange={(e) => toggle(e.target.checked)} />
        <span>
          <span className="block font-semibold">Dùng làm câu chuyện doanh nghiệp trên Atlas</span>
          <span className="block text-caption text-ink-mute">Hiện đầu tiên trên hồ sơ Atlas khi câu chuyện được công khai.</span>
        </span>
      </label>
    </Card>
  );
}

export function StoryEditor({ orgId, isAdmin, story, featured, defaultType }: { orgId: string; isAdmin: boolean; story: St | null; featured: boolean; defaultType?: StoryType }) {
  return (
    <ContentEditor<St, Form>
      orgId={orgId}
      isAdmin={isAdmin}
      collection="stories"
      noun="câu chuyện"
      listLabel="Câu chuyện"
      entity={story}
      title={(s) => s.titleVi}
      toForm={(s) => toForm(s, defaultType)}
      canSave={(f) => Boolean(f.titleVi.trim())}
      payload={(f) => ({
        ...enPayload(f.en),
        storyType: f.storyType,
        titleVi: f.titleVi,
        storyDate: f.hasDate ? f.storyDate : null,
        summaryVi: f.summaryVi || null,
        contentVi: f.content || null,
        internalNotes: f.internalNotes || null,
        coverMediaId: f.cover,
      })}
      fields={(form, set, err) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
            <Field label="Loại câu chuyện *">
              <Select value={form.storyType} onChange={(e) => set('storyType', e.target.value as StoryType)}>
                {STORY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {STORY_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tiêu đề *" error={err('titleVi')}>
              <Input value={form.titleVi} maxLength={200} onChange={(e) => set('titleVi', e.target.value)} />
            </Field>
          </div>
          <Field label={`Tóm tắt (${form.summaryVi.length}/500)`} hint="Cần có trước khi gửi duyệt." error={err('summaryVi')}>
            <Textarea rows={2} maxLength={500} value={form.summaryVi} onChange={(e) => set('summaryVi', e.target.value)} />
          </Field>
          <RichText label="Nội dung" hint="Cần có trước khi gửi duyệt." minRows={10} value={form.content} onChange={(v) => set('content', v)} error={err('contentVi')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <OptionalDate label="Gắn với thời điểm" on={form.hasDate} value={form.storyDate} onToggle={(v) => set('hasDate', v)} onChange={(v) => set('storyDate', v)} />
          </div>
          <CoverField orgId={orgId} label="Ảnh bìa" value={form.cover} initial={story?.cover ?? null} onChange={(id) => set('cover', id)} />
          <EnglishFields spec={EN} value={form.en} onChange={(v) => set('en', v)} />
          <InternalNotesField value={form.internalNotes} onChange={(v) => set('internalNotes', v)} />
        </>
      )}
      read={(s) => (
        <>
          <p className="text-caption text-ink-mute">{STORY_TYPE_LABELS[s.storyType]}</p>
          {s.summaryVi && <p className="text-body-lg">{s.summaryVi}</p>}
          <Html html={s.contentVi} />
        </>
      )}
      extraPanel={isAdmin ? (s) => s.storyType === 'COMPANY' && <FeaturedPanel orgId={orgId} story={s} featured={featured} /> : undefined}
    />
  );
}
