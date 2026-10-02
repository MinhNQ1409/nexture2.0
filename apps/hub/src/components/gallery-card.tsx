'use client';
// "Ảnh & video" block (06 §7): gallery saved at once with PUT .../media.
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, TriangleAlert, X } from 'lucide-react';
import { api, type ApiError } from '@/lib/fetcher';
import { MediaPicker, MediaThumb } from './media-picker';
import { Button, Card } from './ui';

export type GalleryItem = { id: string; title: string; kind: string; url: string; caption: string | null; isPublic: boolean };

export function GalleryCard({ orgId, collection, entityId, items, canEdit, onChange }: { orgId: string; collection: string; entityId: string; items: GalleryItem[]; canEdit: boolean; onChange: (i: GalleryItem[]) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: GalleryItem[]) {
    const prev = items;
    onChange(next);
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ media: GalleryItem[] }>(`/orgs/${orgId}/${collection}/${entityId}/media`, {
        method: 'PUT',
        json: { items: next.map((i) => ({ mediaId: i.id, caption: i.caption })) },
      });
      onChange(r.media);
    } catch (e) {
      onChange(prev);
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }
  const move = (i: number, by: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + by, 0, x!);
    save(next);
  };

  if (!canEdit && items.length === 0) return null;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-heading-sm">Ảnh &amp; video</h2>
        {canEdit && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => setOpen(true)}>
            <Plus size={16} strokeWidth={1.5} aria-hidden />
            Thêm ảnh
          </Button>
        )}
      </div>
      {error && <p className="text-caption text-error">{error}</p>}
      {items.length === 0 ? (
        <p className="text-body-md text-ink-mute">Chưa có ảnh nào.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((m, i) => (
            <li key={m.id} className="flex flex-col gap-1">
              <div className="relative">
                <Link href={`/o/${orgId}/library/${m.id}`}>
                  <MediaThumb m={m} className="aspect-[4/3] w-full rounded-md border border-hairline" />
                </Link>
                {!m.isPublic && (
                  <span title="Ảnh này sẽ không hiển thị trên Atlas vì chưa được xác minh và công khai" className="absolute left-2 top-2 rounded-pill bg-warning-bg p-1 text-warning">
                    <TriangleAlert size={14} strokeWidth={1.5} aria-label="Chưa công khai" />
                  </span>
                )}
                {canEdit && (
                  <div className="absolute right-1 top-1 flex gap-1">
                    {i > 0 && (
                      <button type="button" disabled={busy} aria-label="Lên trước" onClick={() => move(i, -1)} className="rounded-sm bg-canvas-white/90 p-1 hover:text-primary">
                        <ArrowLeft size={14} strokeWidth={1.5} aria-hidden />
                      </button>
                    )}
                    {i < items.length - 1 && (
                      <button type="button" disabled={busy} aria-label="Ra sau" onClick={() => move(i, 1)} className="rounded-sm bg-canvas-white/90 p-1 hover:text-primary">
                        <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
                      </button>
                    )}
                    <button type="button" disabled={busy} aria-label={`Gỡ ${m.title}`} onClick={() => save(items.filter((x) => x.id !== m.id))} className="rounded-sm bg-canvas-white/90 p-1 hover:text-error">
                      <X size={14} strokeWidth={1.5} aria-hidden />
                    </button>
                  </div>
                )}
              </div>
              {canEdit ? (
                <input
                  defaultValue={m.caption ?? ''}
                  maxLength={300}
                  placeholder="Chú thích"
                  aria-label={`Chú thích cho ${m.title}`}
                  className="rounded-sm border border-hairline px-2 py-1 text-caption"
                  onBlur={(e) => {
                    const v = e.target.value.trim() || null;
                    if (v !== m.caption) save(items.map((x) => (x.id === m.id ? { ...x, caption: v } : x)));
                  }}
                />
              ) : (
                m.caption && <span className="text-caption text-ink-mute">{m.caption}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {open && (
        <MediaPicker
          orgId={orgId}
          kinds="IMAGE,VIDEO"
          title="Thêm ảnh hoặc video"
          onClose={() => setOpen(false)}
          onPick={(m) => {
            setOpen(false);
            if (!items.some((x) => x.id === m.id)) save([...items, { id: m.id, title: m.title, kind: m.kind, url: m.url, caption: null, isPublic: false }]);
          }}
        />
      )}
    </Card>
  );
}
