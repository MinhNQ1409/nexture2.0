'use client';
// Media detail (06 §10): preview, metadata, review status, visibility and where it is used.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { MEDIA_KIND_LABELS, VISIBILITY_LABELS, type ContentStatus, type Visibility } from '@nexture/contracts';
import { PublicStateBadge, StatusBadge, type PublicStateValue } from '@/components/badges';
import { FuzzyDateInput, thisYear, type FuzzyValue } from '@/components/fuzzy-date';
import { Alert, Button, Card, Field, Input, Textarea, cx } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';

type Media = {
  id: string;
  title: string;
  kind: string;
  mimeType: string;
  url: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  description: string | null;
  originalFilename: string;
  sizeBytes: number;
  occurredDate: FuzzyValue | null;
  sourceNote: string | null;
  providedBy: string | null;
  tags: string[];
  status: ContentStatus;
  visibility: Visibility;
  publicState: PublicStateValue;
  version: number;
  createdAt: string;
  permissions: { canEdit: boolean; canDelete: boolean; canSubmit: boolean; canWithdraw: boolean; canApprove: boolean; canReturn: boolean; canUnverify: boolean; allowedVisibilities: Visibility[] };
  usedIn: { type: string; id: string; title: string; how: 'COVER' | 'GALLERY' | 'LOGO' }[];
};
type Form = { title: string; altText: string; description: string; hasDate: boolean; occurredDate: FuzzyValue; sourceNote: string; providedBy: string; tags: string };

const toForm = (m: Media): Form => ({
  title: m.title,
  altText: m.altText ?? '',
  description: m.description ?? '',
  hasDate: Boolean(m.occurredDate),
  occurredDate: m.occurredDate ?? thisYear(),
  sourceNote: m.sourceNote ?? '',
  providedBy: m.providedBy ?? '',
  tags: m.tags.join(', '),
});
const HREF: Record<string, string> = { STORY: 'stories', EVENT: 'events', PERSON: 'people', PRODUCT_PROJECT: 'products' };
const HOW = { COVER: 'Ảnh bìa', GALLERY: 'Trong bộ ảnh', LOGO: 'Logo doanh nghiệp' } as const;
const VIS_HELP: Record<Visibility, string> = {
  PRIVATE: 'Chỉ Quản trị và Biên tập thấy.',
  INTERNAL: 'Mọi thành viên thấy khi đã xác minh.',
  PUBLIC: 'Được phép hiện trên Atlas khi gắn vào nội dung công khai.',
};

export function MediaDetail({ orgId, isAdmin, initial }: { orgId: string; isAdmin: boolean; initial: Media }) {
  const router = useRouter();
  const [m, setM] = useState(initial);
  const [form, setForm] = useState(() => toForm(initial));
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const base = `/orgs/${orgId}/media/${m.id}`;
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(m));
  const p = m.permissions;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...form, [k]: v });

  async function run(fn: () => Promise<Media>, msg?: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const next = await fn();
      setM(next);
      setForm(toForm(next));
      if (msg) setNotice(msg);
      router.refresh();
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  }
  const save = () =>
    run(
      () =>
        api<Media>(base, {
          method: 'PATCH',
          json: {
            version: m.version,
            title: form.title,
            altText: form.altText || null,
            description: form.description || null,
            occurredDate: form.hasDate ? form.occurredDate : null,
            sourceNote: form.sourceNote || null,
            providedBy: form.providedBy || null,
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          },
        }),
      'Đã lưu.',
    );
  const act = (action: string, body: Record<string, unknown> = {}, msg?: string) => run(() => api<Media>(`${base}/${action}`, { method: 'POST', json: { version: m.version, ...body } }), msg);
  function changeVisibility(v: Visibility) {
    if (v === m.visibility) return;
    if (v === 'PUBLIC' && !confirm('Công khai tư liệu này? Ảnh sẽ hiện trên Atlas ở những nội dung công khai đang dùng nó.')) return;
    run(() => api<Media>(`${base}/visibility`, { method: 'PUT', json: { version: m.version, visibility: v } }));
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <Link href={`/o/${orgId}/library`} className="inline-flex w-fit items-center gap-2 text-body-md text-ink-mute hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
        Thư viện tư liệu
      </Link>
      <h1 className="text-display-md">{m.title}</h1>
      {error && <Alert>{error.message}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <Card className="flex flex-col items-center gap-3">
            {m.kind === 'IMAGE' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async" src={m.url} alt={m.altText ?? m.title} className="max-h-[480px] w-auto max-w-full rounded-md object-contain" />
            ) : m.kind === 'VIDEO' ? (
              <video src={m.url} controls className="max-h-[480px] w-full rounded-md" />
            ) : m.kind === 'AUDIO' ? (
              <audio src={m.url} controls className="w-full" />
            ) : (
              <FileText size={64} strokeWidth={1.5} className="text-ink-mute" aria-hidden />
            )}
            <p className="text-caption text-ink-mute">
              {MEDIA_KIND_LABELS[m.kind as keyof typeof MEDIA_KIND_LABELS]} · {m.originalFilename} · {(m.sizeBytes / 1048576).toFixed(2)} MB
              {m.width && m.height ? ` · ${m.width}×${m.height}` : ''}
            </p>
            <a href={m.url} target="_blank" rel="noopener" download={m.originalFilename} className="inline-flex items-center gap-2 text-link underline hover:text-link-hover">
              <Download size={16} strokeWidth={1.5} aria-hidden />
              Tải xuống
            </a>
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="text-heading-sm">Thông tin tư liệu</h2>
            <fieldset disabled={!p.canEdit || busy} className="flex flex-col gap-4">
              <Field label="Tên tư liệu *">
                <Input value={form.title} maxLength={200} onChange={(e) => set('title', e.target.value)} />
              </Field>
              {m.kind === 'IMAGE' && (
                <Field label="Mô tả ảnh cho người dùng trình đọc màn hình" hint="Hiện trên Atlas thay cho ảnh khi cần.">
                  <Input value={form.altText} maxLength={300} onChange={(e) => set('altText', e.target.value)} />
                </Field>
              )}
              <Field label="Mô tả">
                <Textarea rows={3} maxLength={2000} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </Field>
              <div>
                <label className="flex min-h-6 items-center gap-2 pb-1 text-body-md font-semibold">
                  <input type="checkbox" className="accent-primary" checked={form.hasDate} onChange={(e) => set('hasDate', e.target.checked)} />
                  Thời điểm ghi lại
                </label>
                {form.hasDate && <FuzzyDateInput value={form.occurredDate} onChange={(v) => set('occurredDate', v)} />}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Người cung cấp">
                  <Input value={form.providedBy} maxLength={200} onChange={(e) => set('providedBy', e.target.value)} />
                </Field>
                <Field label="Thẻ" hint="Cách nhau bằng dấu phẩy.">
                  <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} />
                </Field>
              </div>
              <Field label="Nguồn">
                <Input value={form.sourceNote} maxLength={500} onChange={(e) => set('sourceNote', e.target.value)} />
              </Field>
            </fieldset>
            {p.canEdit && (
              <div className="flex justify-end border-t border-hairline pt-4">
                <Button disabled={busy || !dirty || !form.title.trim()} onClick={save}>
                  Lưu
                </Button>
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-2">
            <h2 className="text-heading-sm">Đang được dùng</h2>
            {m.usedIn.length === 0 ? (
              <p className="text-body-md text-ink-mute">Chưa gắn vào nội dung nào.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {m.usedIn.map((u) => (
                  <li key={`${u.type}-${u.id}-${u.how}`} className="text-body-md">
                    <Link href={u.type === 'ORGANIZATION' ? `/o/${orgId}/settings/profile` : `/o/${orgId}/${HREF[u.type]}/${u.id}`} className="text-link underline hover:text-link-hover">
                      {u.title}
                    </Link>
                    <span className="text-ink-mute"> · {HOW[u.how]}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[72px] lg:col-span-4">
          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={m.status} />
              <PublicStateBadge state={m.publicState} />
            </div>
            <div className="flex flex-col gap-2" title={dirty ? 'Hãy lưu thay đổi trước' : undefined}>
              {p.canSubmit && m.status === 'DRAFT' && (
                <Button variant="secondary" disabled={busy || dirty} onClick={() => act('submit', {}, 'Đã gửi duyệt.')}>
                  Gửi duyệt
                </Button>
              )}
              {p.canApprove && m.status !== 'VERIFIED' && (
                <Button disabled={busy || dirty} onClick={() => act('approve', {}, 'Đã xác minh.')}>
                  Xác minh
                </Button>
              )}
              {p.canReturn && m.status === 'PENDING_REVIEW' && (
                <Button variant="secondary" disabled={busy || dirty} onClick={() => act('return', {}, 'Đã trả lại.')}>
                  Trả lại
                </Button>
              )}
              {p.canWithdraw && m.status === 'PENDING_REVIEW' && (
                <Button variant="ghost" disabled={busy || dirty} onClick={() => act('withdraw', {}, 'Đã rút lại.')}>
                  Rút lại
                </Button>
              )}
              {p.canUnverify && m.status === 'VERIFIED' && (
                <Button variant="ghost" disabled={busy || dirty} onClick={() => confirm('Tư liệu sẽ trở về Nháp và bị gỡ khỏi Atlas nếu đang công khai.') && act('unverify', {}, 'Đã bỏ xác minh.')}>
                  Bỏ xác minh
                </Button>
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-2">
            <h2 className="text-heading-sm">Hiển thị</h2>
            {(['PRIVATE', 'INTERNAL', 'PUBLIC'] as const).map((v) => {
              const allowed = v === 'PUBLIC' ? isAdmin && m.status === 'VERIFIED' : p.allowedVisibilities.includes(v);
              return (
                <label
                  key={v}
                  className={cx(
                    'flex cursor-pointer gap-3 rounded-md border p-3',
                    m.visibility === v ? 'border-primary bg-primary-light' : 'border-hairline hover:bg-canvas-section',
                    (!allowed || busy) && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <input type="radio" name="visibility" className="mt-1 accent-primary" checked={m.visibility === v} disabled={!allowed || busy} onChange={() => changeVisibility(v)} />
                  <span>
                    <span className="block font-semibold">{VISIBILITY_LABELS[v]}</span>
                    <span className="block text-caption text-ink-mute">{v === 'PUBLIC' && isAdmin && m.status !== 'VERIFIED' ? 'Cần xác minh trước.' : VIS_HELP[v]}</span>
                  </span>
                </label>
              );
            })}
          </Card>

          {p.canDelete && (
            <Button
              variant="ghost"
              className="text-error"
              disabled={busy || m.usedIn.length > 0}
              title={m.usedIn.length ? 'Gỡ tư liệu khỏi các nội dung đang dùng trước khi xóa' : undefined}
              onClick={async () => {
                if (!confirm(`Xóa "${m.title}"?`)) return;
                setBusy(true);
                try {
                  await api(base, { method: 'DELETE' });
                  router.replace(`/o/${orgId}/library`);
                } catch (e) {
                  setError(e as ApiError);
                  setBusy(false);
                }
              }}
            >
              Xóa tư liệu
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
