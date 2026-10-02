'use client';
// Person create/detail (06 §7).
import type { PersonDto } from '@nexture/core';
import { formatFuzzyDate } from '@nexture/contracts';
import { CoverField } from '@/components/media-picker';
import { ContentEditor, Html, InternalNotesField, type ContentBase } from '@/components/content-editor';
import { OptionalDate, thisYear, type FuzzyValue } from '@/components/fuzzy-date';
import { Field, Input } from '@/components/ui';
import { EnglishFields, enForm, enPayload, type EnForm, type EnSpec } from '@/components/english-fields';
import { RichText } from '@/components/rich-text';

type Pe = PersonDto & ContentBase;
const EN: EnSpec[] = [{ key: 'roleTitleEn', label: 'Role', kind: 'input', max: 150 }, { key: 'bioEn', label: 'Biography', kind: 'rich' }, { key: 'contributionsEn', label: 'Contributions', kind: 'rich' }];
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
  internalNotes: string; en: EnForm;
  cover: string | null;
};

const toForm = (p: Pe | null, founder = false): Form => ({
  fullName: p?.fullName ?? '',
  roleTitleVi: p?.roleTitleVi ?? '',
  isFounder: p?.isFounder ?? founder,
  hasJoined: Boolean(p?.joinedDate),
  joinedDate: p?.joinedDate ?? thisYear(),
  hasLeft: Boolean(p?.leftDate),
  leftDate: p?.leftDate ?? thisYear(),
  bio: p?.bioVi ?? '',
  contributions: p?.contributionsVi ?? '',
  internalNotes: p?.internalNotes ?? '',
  en: enForm(p as Record<string, unknown> | null, EN),
  cover: p?.cover?.id ?? null,
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
        ...enPayload(f.en),
        fullName: f.fullName,
        roleTitleVi: f.roleTitleVi || null,
        isFounder: f.isFounder,
        joinedDate: f.hasJoined ? f.joinedDate : null,
        leftDate: f.hasLeft ? f.leftDate : null,
        bioVi: f.bio || null,
        contributionsVi: f.contributions || null,
        internalNotes: f.internalNotes || null,
        avatarMediaId: f.cover,
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
          <RichText label="Tiểu sử" value={form.bio} onChange={(v) => set('bio', v)} />
          <RichText label="Đóng góp nổi bật" minRows={3} value={form.contributions} onChange={(v) => set('contributions', v)} />
          <CoverField orgId={orgId} label="Ảnh đại diện" value={form.cover} initial={person?.cover ?? null} round onChange={(id) => set('cover', id)} />
          <EnglishFields spec={EN} value={form.en} onChange={(v) => set('en', v)} />
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
