'use client';
// Event create/detail (06 §7): form on the left, status panel on the right.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, MessageSquareWarning } from 'lucide-react';
import { EVENT_TYPE_LABELS, EVENT_TYPES, VISIBILITY_LABELS, type EventType, type Visibility } from '@nexture/contracts';
import type { EventDto } from '@nexture/core';
import { PublicStateBadge, StatusBadge } from '@/components/badges';
import { FuzzyDateInput, type FuzzyValue } from '@/components/fuzzy-date';
import { Alert, Button, Card, Field, Input, Select, Textarea, cx } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';
import { htmlToText, textToHtml } from '@/lib/plain-html';

type Ev = EventDto;
type Form = { eventType: EventType; titleVi: string; startDate: FuzzyValue; hasEnd: boolean; endDate: FuzzyValue; summaryVi: string; content: string; internalNotes: string };

const VIS_HELP: Record<Visibility, string> = {
  PRIVATE: 'Chỉ Quản trị và Biên tập thấy.',
  INTERNAL: 'Mọi thành viên thấy khi đã xác minh.',
  PUBLIC: 'Hiển thị trên Culture Atlas cho mọi người.',
};
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');

function toForm(e: Ev | null): Form {
  const year = { date: `${new Date().getFullYear()}-01-01`, precision: 'YEAR' as const };
  return {
    eventType: e?.eventType ?? 'MILESTONE',
    titleVi: e?.titleVi ?? '',
    startDate: e?.startDate ?? year,
    hasEnd: Boolean(e?.endDate),
    endDate: e?.endDate ?? year,
    summaryVi: e?.summaryVi ?? '',
    content: htmlToText(e?.contentVi ?? null),
    internalNotes: e?.internalNotes ?? '',
  };
}

export function EventEditor({ orgId, isAdmin, event }: { orgId: string; isAdmin: boolean; event: Ev | null }) {
  const router = useRouter();
  const [ev, setEv] = useState(event);
  const [form, setForm] = useState<Form>(() => toForm(event));
  const [saved, setSaved] = useState<Form>(() => toForm(event));
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const canEdit = !ev || ev.permissions.canEdit;
  const p = ev?.permissions;
  const fieldErr = (k: string) => (error?.details?.fields as Record<string, string> | undefined)?.[k];
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...form, [k]: v });

  const payload = () => ({
    eventType: form.eventType,
    titleVi: form.titleVi,
    startDate: form.startDate,
    endDate: form.hasEnd ? form.endDate : null,
    summaryVi: form.summaryVi || null,
    contentVi: textToHtml(form.content) || null,
    internalNotes: form.internalNotes || null,
  });

  async function run(fn: () => Promise<Ev | void>, msg?: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const next = await fn();
      if (next) {
        setEv(next);
        setForm(toForm(next));
        setSaved(toForm(next));
      }
      if (msg) setNotice(msg);
      router.refresh();
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  async function create(status: 'DRAFT' | 'VERIFIED') {
    setBusy(true);
    setError(null);
    try {
      const e = await api<Ev>(`/orgs/${orgId}/events`, { method: 'POST', json: { ...payload(), status } });
      router.replace(`/o/${orgId}/events/${e.id}`);
    } catch (e) {
      setError(e as ApiError);
      setBusy(false);
    }
  }

  const save = () => run(() => api<Ev>(`/orgs/${orgId}/events/${ev!.id}`, { method: 'PATCH', json: { version: ev!.version, ...payload() } }), 'Đã lưu.');
  const act = (action: string, body: Record<string, unknown> = {}, msg?: string) =>
    run(() => api<Ev>(`/orgs/${orgId}/events/${ev!.id}/${action}`, { method: 'POST', json: { version: ev!.version, ...body } }), msg);

  function changeVisibility(v: Visibility) {
    if (!ev || v === ev.visibility) return;
    if (v === 'PUBLIC' && !confirm('Công khai sự kiện này? Nội dung (trừ ghi chú nội bộ) sẽ hiện trên Culture Atlas cho mọi người.')) return;
    if (ev.publicState === 'LIVE' && !confirm('Nội dung sẽ bị gỡ khỏi Atlas ngay.')) return;
    run(() => api<Ev>(`/orgs/${orgId}/events/${ev.id}/visibility`, { method: 'PUT', json: { version: ev.version, visibility: v } }));
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <Link href={`/o/${orgId}/events`} className="inline-flex w-fit items-center gap-2 text-body-md text-ink-mute hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
        Sự kiện
      </Link>
      <h1 className="text-display-md">{ev ? ev.titleVi : 'Thêm sự kiện'}</h1>
      {error && <Alert>{error.message}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <Card className="flex flex-col gap-4 lg:col-span-8">
          {canEdit ? (
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
                <Field label="Tiêu đề *" error={fieldErr('titleVi')}>
                  <Input value={form.titleVi} maxLength={200} onChange={(e) => set('titleVi', e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ngày bắt đầu *" error={fieldErr('startDate')}>
                  <FuzzyDateInput value={form.startDate} onChange={(v) => set('startDate', v)} />
                </Field>
                <div>
                  <label className="flex items-center gap-2 pb-1 text-body-md font-semibold">
                    <input type="checkbox" className="size-4 accent-primary" checked={form.hasEnd} onChange={(e) => set('hasEnd', e.target.checked)} />
                    Sự kiện kéo dài
                  </label>
                  {form.hasEnd && <FuzzyDateInput value={form.endDate} onChange={(v) => set('endDate', v)} />}
                  {fieldErr('endDate') && <span className="block pt-1 text-caption text-error">{fieldErr('endDate')}</span>}
                </div>
              </div>
              <Field label={`Tóm tắt (${form.summaryVi.length}/500)`} error={fieldErr('summaryVi')}>
                <Textarea rows={2} maxLength={500} value={form.summaryVi} onChange={(e) => set('summaryVi', e.target.value)} />
              </Field>
              <Field label="Nội dung" hint="Xuống dòng hai lần để tách đoạn.">
                <Textarea rows={8} value={form.content} onChange={(e) => set('content', e.target.value)} />
              </Field>
              <div className="rounded-md bg-canvas-section p-3">
                <Field label="Ghi chú nội bộ" hint="Chỉ thành viên Hub thấy, không bao giờ lên Atlas.">
                  <Textarea rows={2} value={form.internalNotes} onChange={(e) => set('internalNotes', e.target.value)} />
                </Field>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-hairline pt-4">
                {ev ? (
                  <Button disabled={busy || !dirty || !form.titleVi.trim()} onClick={save}>
                    Lưu
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" disabled={busy || !form.titleVi.trim()} onClick={() => create('DRAFT')}>
                      Lưu nháp
                    </Button>
                    {isAdmin && (
                      <Button disabled={busy || !form.titleVi.trim()} onClick={() => create('VERIFIED')}>
                        Lưu và xác minh
                      </Button>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <article className="flex flex-col gap-3">
              <p className="text-caption text-ink-mute">{EVENT_TYPE_LABELS[ev!.eventType]}</p>
              {ev!.summaryVi && <p className="text-body-lg">{ev!.summaryVi}</p>}
              {ev!.contentVi && <div className="flex flex-col gap-3 text-body-md [&_a]:text-link [&_a]:underline" dangerouslySetInnerHTML={{ __html: ev!.contentVi }} />}
            </article>
          )}
        </Card>

        {ev && (
          <aside className="flex flex-col gap-4 lg:sticky lg:top-[72px] lg:col-span-4">
            <Card className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={ev.status} />
                <PublicStateBadge state={ev.publicState} />
              </div>
              <ul className="text-caption text-ink-mute">
                <li>
                  Tạo bởi {ev.createdBy.name} · {fmt(ev.createdAt as unknown as string)}
                </li>
                <li>
                  Cập nhật bởi {ev.updatedBy.name} · {fmt(ev.updatedAt as unknown as string)}
                </li>
                {ev.verifiedBy && (
                  <li>
                    Xác minh bởi {ev.verifiedBy.name} · {fmt(ev.verifiedAt as unknown as string)}
                  </li>
                )}
              </ul>
              {ev.returnNote && (
                <p className="flex gap-2 rounded-md border-l-4 border-accent bg-accent-light p-3 text-body-md text-accent-dark">
                  <MessageSquareWarning size={20} strokeWidth={1.5} className="shrink-0" aria-hidden />
                  Quản trị đã trả lại: {ev.returnNote}
                </p>
              )}
              <div className="flex flex-col gap-2" title={dirty ? 'Hãy lưu thay đổi trước' : undefined}>
                {p!.canSubmit && (
                  <Button variant="secondary" disabled={busy || dirty} onClick={() => act('submit', {}, 'Đã gửi duyệt.')}>
                    Gửi duyệt
                  </Button>
                )}
                {p!.canApprove && (
                  <Button disabled={busy || dirty} onClick={() => act('approve', {}, 'Đã xác minh.')}>
                    Xác minh
                  </Button>
                )}
                {p!.canReturn && (
                  <Button
                    variant="secondary"
                    disabled={busy || dirty}
                    onClick={() => {
                      const note = prompt('Lý do trả lại (bắt buộc):')?.trim();
                      if (note) act('return', { note }, 'Đã trả lại cho người gửi.');
                    }}
                  >
                    Trả lại
                  </Button>
                )}
                {p!.canWithdraw && (
                  <Button variant="ghost" disabled={busy || dirty} onClick={() => act('withdraw', {}, 'Đã rút lại.')}>
                    Rút lại
                  </Button>
                )}
                {p!.canUnverify && (
                  <Button
                    variant="ghost"
                    disabled={busy || dirty}
                    onClick={() => confirm('Nội dung sẽ trở về Nháp. Nếu đang công khai, nội dung sẽ bị gỡ khỏi Atlas.') && act('unverify', {}, 'Đã bỏ xác minh.')}
                  >
                    Bỏ xác minh
                  </Button>
                )}
              </div>
            </Card>

            <Card className="flex flex-col gap-2">
              <h2 className="text-heading-sm">Hiển thị</h2>
              {(['PRIVATE', 'INTERNAL', 'PUBLIC'] as const).map((v) => {
                const allowed = p!.allowedVisibilities.includes(v);
                const needVerify = v === 'PUBLIC' && isAdmin && ev.status !== 'VERIFIED';
                return (
                  <label
                    key={v}
                    title={needVerify ? 'Cần xác minh trước' : undefined}
                    className={cx(
                      'flex cursor-pointer gap-3 rounded-md border p-3',
                      ev.visibility === v ? 'border-primary bg-primary-light' : 'border-hairline hover:bg-canvas-section',
                      (!allowed || busy) && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <input type="radio" name="visibility" className="mt-1 accent-primary" checked={ev.visibility === v} disabled={!allowed || busy} onChange={() => changeVisibility(v)} />
                    <span>
                      <span className="block font-semibold">{VISIBILITY_LABELS[v]}</span>
                      <span className="block text-caption text-ink-mute">{needVerify ? 'Cần xác minh trước.' : VIS_HELP[v]}</span>
                    </span>
                  </label>
                );
              })}
              {ev.publicState === 'WAITING_ORG' && <p className="text-caption text-warning">Sẽ hiển thị khi hồ sơ doanh nghiệp được bật trên Atlas.</p>}
              {ev.publicState === 'HIDDEN_BY_NEXTURE' && <p className="text-caption text-error">Bị NexTure ẩn: {ev.atlasHiddenReason}</p>}
              {ev.publicUrl && (
                <a href={ev.publicUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-link underline hover:text-link-hover">
                  Xem trên Atlas
                  <ExternalLink size={16} strokeWidth={1.5} aria-hidden />
                </a>
              )}
            </Card>

            {p!.canDelete && (
              <Button
                variant="ghost"
                className="text-error"
                disabled={busy}
                onClick={async () => {
                  if (!confirm(`Xóa "${ev.titleVi}"?${ev.publicState === 'LIVE' ? ' Nội dung sẽ bị gỡ khỏi Atlas.' : ''}`)) return;
                  await run(async () => {
                    await api(`/orgs/${orgId}/events/${ev.id}`, { method: 'DELETE' });
                    router.replace(`/o/${orgId}/events`);
                  });
                }}
              >
                Xóa sự kiện
              </Button>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
