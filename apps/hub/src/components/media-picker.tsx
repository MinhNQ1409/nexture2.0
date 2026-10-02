'use client';
// MediaPicker (06 §10): pick READY media from the library or upload a new file.
import { useEffect, useRef, useState } from 'react';
import { FileText, Film, Search, Upload, X } from 'lucide-react';
import { api, type ApiError } from '@/lib/fetcher';
import { uploadFile, type MediaRef } from '@/lib/upload';
import { Button, cx } from './ui';

type Item = MediaRef & { status: string; visibility: string };

export function MediaThumb({ m, className }: { m: { kind: string; url: string; title: string }; className?: string }) {
  if (m.kind === 'IMAGE') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.url} alt={m.title} className={cx('object-cover', className)} />;
  }
  const Icon = m.kind === 'VIDEO' ? Film : FileText;
  return (
    <span className={cx('flex items-center justify-center bg-canvas-section text-ink-mute', className)}>
      <Icon size={28} strokeWidth={1.5} aria-hidden />
    </span>
  );
}

export function MediaPicker({ orgId, kinds, onPick, onClose, title = 'Chọn ảnh' }: { orgId: string; kinds: string; onPick: (m: MediaRef) => void; onClose: () => void; title?: string }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const qs = q.trim().length >= 2 ? `&q=${encodeURIComponent(q.trim())}` : '';
        const r = await api<{ items: Item[] }>(`/orgs/${orgId}/media?kind=${kinds}&pageSize=48${qs}`);
        setItems(r.items);
      } catch (e) {
        setError((e as ApiError).message);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [q, orgId, kinds]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onPick(await uploadFile(orgId, file));
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  const accept = kinds.includes('VIDEO') ? 'image/png,image/jpeg,image/webp,video/mp4' : 'image/png,image/jpeg,image/webp';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-4 rounded-xl bg-canvas-white p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-heading-md">{title}</h2>
          <Button variant="ghost" size="sm" aria-label="Đóng" onClick={onClose}>
            <X size={20} strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-hairline px-3">
            <Search size={16} strokeWidth={1.5} className="text-ink-mute" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm trong thư viện" className="w-full bg-transparent text-body-md outline-none" />
          </label>
          <input ref={fileRef} type="file" accept={accept} className="sr-only" aria-label="Chọn tệp để tải lên" onChange={(e) => upload(e.target.files?.[0])} />
          <Button variant="secondary" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload size={16} strokeWidth={1.5} aria-hidden />
            {busy ? 'Đang tải lên' : 'Tải lên mới'}
          </Button>
        </div>
        {error && <p className="text-body-md text-error">{error}</p>}
        <div className="min-h-40 overflow-y-auto">
          {items === null ? (
            <p className="text-body-md text-ink-mute">Đang tải</p>
          ) : items.length === 0 ? (
            <p className="text-body-md text-ink-mute">Thư viện chưa có ảnh phù hợp. Hãy tải lên một tệp mới.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => onPick(m)} className="group flex w-full flex-col gap-1 text-left">
                    <MediaThumb m={m} className="aspect-square w-full rounded-md border border-hairline group-hover:border-primary" />
                    <span className="truncate text-caption text-ink-mute group-hover:text-ink">{m.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/** Cover/avatar field: the form keeps the id; the preview is kept here. */
export function CoverField({
  orgId,
  label,
  value,
  initial,
  round,
  onChange,
}: {
  orgId: string;
  label: string;
  value: string | null;
  initial: { id: string; url: string; title: string } | null;
  round?: boolean;
  onChange: (id: string | null) => void;
}) {
  const [preview, setPreview] = useState(initial);
  const [open, setOpen] = useState(false);
  const shown = value && preview?.id === value ? preview : value === initial?.id ? initial : null;
  return (
    <div>
      <span className="block pb-1 text-body-md font-semibold">{label}</span>
      <div className="flex items-center gap-4">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown.url} alt={shown.title} className={cx('size-24 border border-hairline object-cover', round ? 'rounded-full' : 'rounded-md')} />
        ) : (
          <span className={cx('flex size-24 items-center justify-center border border-dashed border-hairline bg-canvas-section text-caption text-ink-mute', round ? 'rounded-full' : 'rounded-md')}>
            Chưa có
          </span>
        )}
        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            {value ? 'Đổi ảnh' : 'Chọn ảnh'}
          </Button>
          {value && (
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              Gỡ ảnh
            </Button>
          )}
        </div>
      </div>
      <span className="block pt-1 text-caption text-ink-mute">Ảnh chỉ hiện trên Atlas khi tư liệu đã được xác minh và công khai.</span>
      {open && (
        <MediaPicker
          orgId={orgId}
          kinds="IMAGE"
          onClose={() => setOpen(false)}
          onPick={(m) => {
            setPreview({ id: m.id, url: m.url, title: m.title });
            onChange(m.id);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
