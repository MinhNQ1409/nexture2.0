'use client';
// Person create/detail (06 §7).
import type { PersonDto } from '@nexture/core';
import { formatFuzzyDate } from '@nexture/contracts';
import { ContentEditor, Html, InternalNotesField, type ContentBase } from '@/components/content-editor';
import { OptionalDate, thisYear, type FuzzyValue } from '@/components/fuzzy-date';
import { Field, Input, Textarea } from '@/components/ui';
import { htmlToText, textToHtml } from '@/lib/plain-html';

type Pe = PersonDto & ContentBase;
type Form = {
  fullName: string;
  roleTitleVi: string;
  isFounder: boolean;
  hasJoined: boolean;
  joinedDate: FuzzyValue;
  hasLeft: boolean;
  leftDate: FuzzyValue;
  bio: string;
  contributions: string;
  internalNotes: string;
};

const toForm = (p: Pe | null, founder = false): Form => ({
  fullName: p?.fullName ?? '',
  roleTitleVi: p?.roleTitleVi ?? '',
  isFounder: p?.isFounder ?? founder,
  hasJoined: Boolean(p?.joinedDate),
  joinedDate: p?.joinedDate ?? thisYear(),
  hasLeft: Boolean(p?.leftDate),
  leftDate: p?.leftDate ?? thisYear(),
  bio: htmlToText(p?.bioVi ?? null),
  contributions: htmlToText(p?.contributionsVi ?? null),
  internalNotes: p?.internalNotes ?? '',
});

export function PersonEditor({ orgId, isAdmin, person, founder }: { orgId: string; isAdmin: boolean; person: Pe | null; founder?: boolean }) {
  return (
    <ContentEditor<Pe, Form>
      orgId={orgId}
      isAdmin={isAdmin}
      collection="people"
      noun="người"
      listLabel="Con người"
      entity={person}
      title={(p) => p.fullName}
      toForm={(p) => toForm(p, founder)}
      canSave={(f) => Boolean(f.fullName.trim())}
      payload={(f) => ({
        fullName: f.fullName,
        roleTitleVi: f.roleTitleVi || null,
        isFounder: f.isFounder,
        joinedDate: f.hasJoined ? f.joinedDate : null,
        leftDate: f.hasLeft ? f.leftDate : null,
        bioVi: textToHtml(f.bio) || null,
        contributionsVi: textToHtml(f.contributions) || null,
        internalNotes: f.internalNotes || null,
      })}
      fields={(form, set, err) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Họ tên *" error={err('fullName')}>
              <Input value={form.fullName} maxLength={150} onChange={(e) => set('fullName', e.target.value)} />
            </Field>
            <Field label="Vai trò / Chức danh" hint="Cần có trước khi gửi duyệt." error={err('roleTitleVi')}>
              <Input value={form.roleTitleVi} maxLength={150} onChange={(e) => set('roleTitleVi', e.target.value)} />
            </Field>
          </div>
          <label className="flex w-fit items-center gap-2 text-body-md font-semibold">
            <input type="checkbox" className="size-4 accent-primary" checked={form.isFounder} onChange={(e) => set('isFounder', e.target.checked)} />
            Là người sáng lập
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <OptionalDate label="Có thời gian gia nhập" on={form.hasJoined} value={form.joinedDate} onToggle={(v) => set('hasJoined', v)} onChange={(v) => set('joinedDate', v)} />
            <OptionalDate label="Đã rời doanh nghiệp" on={form.hasLeft} value={form.leftDate} onToggle={(v) => set('hasLeft', v)} onChange={(v) => set('leftDate', v)} error={err('leftDate')} />
          </div>
          <Field label="Tiểu sử" hint="Xuống dòng hai lần để tách đoạn.">
            <Textarea rows={6} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
          </Field>
          <Field label="Đóng góp nổi bật">
            <Textarea rows={4} value={form.contributions} onChange={(e) => set('contributions', e.target.value)} />
          </Field>
          <InternalNotesField value={form.internalNotes} onChange={(v) => set('internalNotes', v)} />
          <p className="text-caption text-ink-mute">Không nhập thông tin liên hệ cá nhân (số điện thoại, email, địa chỉ nhà).</p>
        </>
      )}
      read={(p) => (
        <>
          <p className="text-caption text-ink-mute">
            {[p.isFounder && 'Người sáng lập', p.roleTitleVi, p.joinedDate && `Từ ${formatFuzzyDate(p.joinedDate)}${p.leftDate ? ` đến ${formatFuzzyDate(p.leftDate)}` : ''}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <Html html={p.bioVi} />
          {p.contributionsVi && (
            <>
              <h2 className="text-heading-sm">Đóng góp nổi bật</h2>
              <Html html={p.contributionsVi} />
            </>
          )}
        </>
      )}
    />
  );
}
