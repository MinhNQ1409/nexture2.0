'use client';
// Shared create/detail screen for Story, Event, Person, Product (06 §7): form on the left, status panel on the right.
// Each kind passes its own fields and read view; workflow, visibility, related items and delete are the same.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import { GalleryCard, type GalleryItem } from './gallery-card';
import { RelationsCard } from './relations-card';
import { proseClass } from './rich-text';
import { ArrowLeft, ExternalLink, MessageSquareWarning } from 'lucide-react';
import { VISIBILITY_LABELS, type ContentStatus, type Visibility } from '@nexture/contracts';
import { PublicStateBadge, StatusBadge, type PublicStateValue } from '@/components/badges';
import { Alert, Button, Card, cx } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';

export type RelatedItem = { id: string; type: string; title: string; status: string | null };
export type ContentBase = {
  id: string;
  version: number;
  status: ContentStatus;
  visibility: Visibility;
  publicState: PublicStateValue;
  publicUrl: string | null;
  returnNote: string | null;
  atlasHiddenReason: string | null;
  internalNotes: string | null;
  createdBy: { name: string };
  createdAt: string;
  updatedBy: { name: string };
  updatedAt: string;
  verifiedBy: { name: string } | null;
  verifiedAt: string | null;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canSubmit: boolean;
    canWithdraw: boolean;
    canApprove: boolean;
    canReturn: boolean;
    canUnverify: boolean;
    allowedVisibilities: Visibility[];
  };
  cover: { id: string; url: string; title: string } | null;
  media: GalleryItem[];
  related: { stories: RelatedItem[]; events: RelatedItem[]; people: RelatedItem[]; products: RelatedItem[]; values: RelatedItem[] };
};

export type FieldErr = (k: string) => string | undefined;
export type Setter<F> = <K extends keyof F>(k: K, v: F[K]) => void;

const VIS_HELP: Record<Visibility, string> = {
  PRIVATE: 'Chỉ Quản trị và Biên tập thấy.',
  INTERNAL: 'Mọi thành viên thấy khi đã xác minh.',
  PUBLIC: 'Hiển thị trên Culture Atlas cho mọi người.',
};
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');

export function ContentEditor<E extends ContentBase, F>(props: {
  orgId: string;
  isAdmin: boolean;
  collection: 'stories' | 'events' | 'people' | 'products';
  /** Lower-case noun: "sự kiện", "câu chuyện". */
  noun: string;
  listLabel: string;
  entity: E | null;
  title: (e: E) => string;
  toForm: (e: E | null) => F;
  payload: (f: F) => Record<string, unknown>;
  canSave: (f: F) => boolean;
  fields: (form: F, set: Setter<F>, err: FieldErr) => ReactNode;
  read: (e: E) => ReactNode;
  extraPanel?: (e: E) => ReactNode;
}) {
  const { orgId, isAdmin, collection, noun, entity } = props;
  const router = useRouter();
  const base = `/orgs/${orgId}/${collection}`;
  const [ev, setEv] = useState(entity);
  const [form, setForm] = useState<F>(() => props.toForm(entity));
  const [saved, setSaved] = useState<F>(() => props.toForm(entity));
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const canEdit = !ev || ev.permissions.canEdit;
  const p = ev?.permissions;
  const fieldErr: FieldErr = (k) => {
    const f = error?.details?.fields;
    if (Array.isArray(f)) return f.includes(k) ? 'Cần nhập trước khi gửi duyệt hoặc xác minh' : undefined;
    return (f as Record<string, string> | undefined)?.[k];
  };
  const set: Setter<F> = (k, v) => setForm({ ...form, [k]: v });

  async function run(fn: () => Promise<E | void>, msg?: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const next = await fn();
      if (next) {
        setEv(next);
        setForm(props.toForm(next));
        setSaved(props.toForm(next));
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
      const e = await api<E>(base, { method: 'POST', json: { ...props.payload(form), status } });
      router.replace(`/o/${orgId}/${collection}/${e.id}`);
    } catch (e) {
      setError(e as ApiError);
      setBusy(false);
    }
  }

  const save = () => run(() => api<E>(`${base}/${ev!.id}`, { method: 'PATCH', json: { version: ev!.version, ...props.payload(form) } }), 'Đã lưu.');
  const act = (action: string, body: Record<string, unknown> = {}, msg?: string) =>
    run(() => api<E>(`${base}/${ev!.id}/${action}`, { method: 'POST', json: { version: ev!.version, ...body } }), msg);

  function changeVisibility(v: Visibility) {
    if (!ev || v === ev.visibility) return;
    if (v === 'PUBLIC' && !confirm(`Công khai ${noun} này? Nội dung (trừ ghi chú nội bộ) sẽ hiện trên Culture Atlas cho mọi người.`)) return;
    if (ev.publicState === 'LIVE' && !confirm('Nội dung sẽ bị gỡ khỏi Atlas ngay.')) return;
    run(() => api<E>(`${base}/${ev.id}/visibility`, { method: 'PUT', json: { version: ev.version, visibility: v } }));
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <Link href={`/o/${orgId}/${collection}`} className="inline-flex w-fit items-center gap-2 text-body-md text-ink-mute hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
        {props.listLabel}
      </Link>
      <h1 className="text-display-md">{ev ? props.title(ev) : `Thêm ${noun}`}</h1>
      {error && <Alert>{error.message}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <Card className="flex flex-col gap-4">
            {canEdit ? (
              <>
                {props.fields(form, set, fieldErr)}
                <div className="flex flex-wrap justify-end gap-2 border-t border-hairline pt-4">
                  {ev ? (
                    <Button disabled={busy || !dirty || !props.canSave(form)} onClick={save}>
                      Lưu
                    </Button>
                  ) : (
                    <>
                      <Button variant="secondary" disabled={busy || !props.canSave(form)} onClick={() => create('DRAFT')}>
                        Lưu nháp
                      </Button>
                      {isAdmin && (
                        <Button disabled={busy || !props.canSave(form)} onClick={() => create('VERIFIED')}>
                          Lưu và xác minh
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <article className="flex flex-col gap-3">
                {props.read(ev!)}
                {ev!.internalNotes && (
                  <div className="rounded-md bg-canvas-section p-3 text-body-md">
                    <p className="text-caption font-semibold text-ink-mute">Ghi chú nội bộ</p>
                    <p className="whitespace-pre-line">{ev!.internalNotes}</p>
                  </div>
                )}
              </article>
            )}
          </Card>

          {ev && (
            <RelationsCard
              orgId={orgId}
              collection={collection}
              entityId={ev.id}
              related={ev.related}
              canEdit={ev.permissions.canEdit}
              onChange={(related) => setEv({ ...ev, related })}
            />
          )}
          {ev && <GalleryCard orgId={orgId} collection={collection} entityId={ev.id} items={ev.media} canEdit={ev.permissions.canEdit} onChange={(media) => setEv({ ...ev, media })} />}
        </div>

        {ev && (
          <aside className="flex flex-col gap-4 lg:sticky lg:top-[72px] lg:col-span-4">
            <Card className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={ev.status} />
                <PublicStateBadge state={ev.publicState} />
              </div>
              <ul className="text-caption text-ink-mute">
                <li>
                  Tạo bởi {ev.createdBy.name} · {fmt(ev.createdAt)}
                </li>
                <li>
                  Cập nhật bởi {ev.updatedBy.name} · {fmt(ev.updatedAt)}
                </li>
                {ev.verifiedBy && (
                  <li>
                    Xác minh bởi {ev.verifiedBy.name} · {fmt(ev.verifiedAt)}
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

            {props.extraPanel?.(ev)}

            {p!.canDelete && (
              <Button
                variant="ghost"
                className="text-error"
                disabled={busy}
                onClick={async () => {
                  if (!confirm(`Xóa "${props.title(ev)}"? Liên kết với nội dung khác sẽ bị gỡ.${ev.publicState === 'LIVE' ? ' Nội dung sẽ bị gỡ khỏi Atlas.' : ''}`)) return;
                  await run(async () => {
                    await api(`${base}/${ev.id}`, { method: 'DELETE' });
                    router.replace(`/o/${orgId}/${collection}`);
                  });
                }}
              >
                Xóa {noun}
              </Button>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/** Internal-notes box used by every kind. */
export function InternalNotesField({ value, onChange, children }: { value: string; onChange: (v: string) => void; children?: ReactNode }) {
  return (
    <div className="rounded-md bg-canvas-section p-3">
      <label className="block">
        <span className="block pb-1 text-body-md font-semibold">Ghi chú nội bộ</span>
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-hairline bg-canvas-white px-3 py-2.5 text-body-md text-ink"
        />
        <span className="block pt-1 text-caption text-ink-mute">Chỉ thành viên Hub thấy, không bao giờ lên Atlas.</span>
      </label>
      {children}
    </div>
  );
}

/** Rendered rich text in read mode (HTML is sanitized on save). */
export function Html({ html, className }: { html: string | null; className?: string }) {
  if (!html) return null;
  return <div className={cx(proseClass, className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
