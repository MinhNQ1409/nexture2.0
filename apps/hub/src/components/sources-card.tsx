'use client';
// "Nguồn & bằng chứng" block (06 §7): each change is saved at once.
import { useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, FileText, Globe, Link2, Plus, X } from 'lucide-react';
import { api, type ApiError } from '@/lib/fetcher';
import { MediaPicker } from './media-picker';
import { Button, Card, Dialog, Field, Input, Textarea, cx } from './ui';

export type SourceItem = { id: string; title: string; url: string | null; media: { id: string; title: string; url: string } | null; note: string | null; isPublic: boolean; sortOrder: number };

type Props = { orgId: string; collection: string; entityId: string; items: SourceItem[]; canEdit: boolean; onChange: (i: SourceItem[]) => void };

export function SourcesCard({ orgId, collection, entityId, items, canEdit, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const base = `/orgs/${orgId}/${collection}/${entityId}/sources`;

  async function call(path: string, init: { method: string; json?: unknown }) {
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ sources: SourceItem[] }>(path, init);
      onChange(r.sources);
      return true;
    } catch (e) {
      setError((e as ApiError).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function move(i: number, by: number) {
    const a = items[i]!;
    const b = items[i + by]!;
    // Normalise order first so equal sortOrders still swap.
    await call(`${base}/${a.id}`, { method: 'PATCH', json: { sortOrder: i + by } });
    await call(`${base}/${b.id}`, { method: 'PATCH', json: { sortOrder: i } });
  }

  if (!canEdit && items.length === 0) return null;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-heading-sm">Nguồn &amp; bằng chứng</h2>
        {canEdit && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => setAdding(true)}>
            <Plus size={16} strokeWidth={1.5} aria-hidden />
            Thêm nguồn
          </Button>
        )}
      </div>
      {error && <p className="text-caption text-error">{error}</p>}
      {items.length === 0 ? (
        <p className="text-body-md text-ink-mute">Chưa có nguồn nào. Thêm bài báo, tài liệu hoặc ảnh làm bằng chứng cho nội dung này.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-hairline">
          {items.map((s, i) => (
            <li key={s.id} className="flex items-start gap-3 py-3">
              <span className="mt-1 text-ink-mute">{s.url ? <Globe size={18} strokeWidth={1.5} aria-hidden /> : <FileText size={18} strokeWidth={1.5} aria-hidden />}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <a href={s.url ?? s.media?.url ?? '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-ink hover:text-primary">
                  <span className="truncate">{s.title}</span>
                  <ExternalLink size={14} strokeWidth={1.5} aria-hidden className="shrink-0" />
                </a>
                <span className="truncate text-caption text-ink-mute">{s.url ?? (s.media ? `Tư liệu: ${s.media.title}` : 'Tư liệu đã bị xóa')}</span>
                {s.note && <p className="text-body-md text-ink-mute">{s.note}</p>}
                {canEdit ? (
                  <label className="flex w-fit items-center gap-2 text-caption">
                    <input
                      type="checkbox"
                      checked={s.isPublic}
                      disabled={busy}
                      className="accent-primary"
                      onChange={(e) => call(`${base}/${s.id}`, { method: 'PATCH', json: { isPublic: e.target.checked } })}
                    />
                    Hiển thị trên Atlas
                  </label>
                ) : (
                  s.isPublic && <span className="text-caption text-primary">Hiển thị trên Atlas</span>
                )}
              </div>
              {canEdit && (
                <div className="flex shrink-0 gap-1">
                  {i > 0 && (
                    <button type="button" disabled={busy} aria-label="Lên trên" onClick={() => move(i, -1)} className="rounded-sm p-1 hover:text-primary">
                      <ArrowUp size={16} strokeWidth={1.5} aria-hidden />
                    </button>
                  )}
                  {i < items.length - 1 && (
                    <button type="button" disabled={busy} aria-label="Xuống dưới" onClick={() => move(i, 1)} className="rounded-sm p-1 hover:text-primary">
                      <ArrowDown size={16} strokeWidth={1.5} aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`Gỡ nguồn ${s.title}`}
                    onClick={() => confirm(`Gỡ nguồn "${s.title}"?`) && call(`${base}/${s.id}`, { method: 'DELETE' })}
                    className="rounded-sm p-1 hover:text-error"
                  >
                    <X size={16} strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {adding && <AddSourceDialog orgId={orgId} busy={busy} onClose={() => setAdding(false)} onSave={async (json) => (await call(base, { method: 'POST', json })) && setAdding(false)} />}
    </Card>
  );
}

function AddSourceDialog({ orgId, busy, onClose, onSave }: { orgId: string; busy: boolean; onClose: () => void; onSave: (json: unknown) => void }) {
  const [tab, setTab] = useState<'link' | 'media'>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [media, setMedia] = useState<{ id: string; title: string } | null>(null);
  const [note, setNote] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [picking, setPicking] = useState(false);
  const ready = title.trim() && (tab === 'link' ? /^https?:\/\/\S+/.test(url.trim()) : media);

  if (picking)
    return (
      <MediaPicker
        orgId={orgId}
        kinds="IMAGE,DOCUMENT,VIDEO,AUDIO"
        title="Chọn tư liệu làm nguồn"
        onClose={() => setPicking(false)}
        onPick={(m) => {
          setMedia(m);
          if (!title.trim()) setTitle(m.title);
          setPicking(false);
        }}
      />
    );
  return (
    <Dialog title="Thêm nguồn" onClose={onClose}>
      <div className="flex gap-1 rounded-md bg-canvas-section p-1" role="tablist">
        {(
          [
            ['link', 'Đường link', Link2],
            ['media', 'Từ thư viện', FileText],
          ] as const
        ).map(([k, l, Icon]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cx('flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-button-md', tab === k ? 'bg-canvas-white text-primary shadow-card' : 'text-ink-mute')}
          >
            <Icon size={16} strokeWidth={1.5} aria-hidden />
            {l}
          </button>
        ))}
      </div>
      {tab === 'link' ? (
        <Field label="Đường link">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" inputMode="url" />
        </Field>
      ) : (
        <Field label="Tư liệu">
          <Button variant="secondary" onClick={() => setPicking(true)}>
            <FileText size={16} strokeWidth={1.5} aria-hidden />
            {media ? media.title : 'Chọn trong thư viện'}
          </Button>
        </Field>
      )}
      <Field label="Tiêu đề">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} placeholder="Ví dụ: Báo Tuổi Trẻ, 12/03/2015" />
      </Field>
      <Field label="Ghi chú" hint="Không bắt buộc">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={2} />
      </Field>
      <label className="flex items-center gap-2 text-body-md">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-primary" />
        Hiển thị trên Atlas khi nội dung được công khai
      </label>
      {tab === 'media' && <p className="text-caption text-ink-mute">Trên Atlas chỉ hiện tên nguồn, không hiện tệp gốc.</p>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button
          disabled={!ready || busy}
          onClick={() => onSave({ title: title.trim(), note: note.trim() || null, isPublic, ...(tab === 'link' ? { url: url.trim() } : { mediaId: media!.id }) })}
        >
          Thêm
        </Button>
      </div>
    </Dialog>
  );
}
