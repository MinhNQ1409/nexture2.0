'use client';
// "Liên quan" block (06 §7): one group per allowed target type; changes are saved at once with PUT .../relations.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { STATUS_LABELS, type ContentStatus } from '@nexture/contracts';
import { api, type ApiError } from '@/lib/fetcher';
import { Card } from './ui';

type Item = { id: string; type: string; title: string; status: string | null };
export type Related = { stories: Item[]; events: Item[]; people: Item[]; products: Item[]; values: Item[] };
type Group = keyof Related;
type Collection = 'stories' | 'events' | 'people' | 'products';

const LABEL: Record<Group, string> = { stories: 'Câu chuyện', events: 'Sự kiện', people: 'Con người', products: 'Sản phẩm & Dự án', values: 'Giá trị văn hóa' };
const TARGET: Record<Group, string> = { stories: 'STORY', events: 'EVENT', people: 'PERSON', products: 'PRODUCT_PROJECT', values: 'CULTURE_VALUE' };
/** 02-database-ghi-chu §6. */
const ALLOWED: Record<Collection, Group[]> = {
  stories: ['events', 'people', 'products', 'values'],
  events: ['people', 'stories', 'products', 'values'],
  people: ['events', 'stories', 'products'],
  products: ['events', 'people', 'stories'],
};

function Picker({ orgId, group, exclude, onPick }: { orgId: string; group: Group; exclude: Set<string>; onPick: (i: Item) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      try {
        if (group === 'values') {
          const r = await api<{ items: { id: string; nameVi: string }[] }>(`/orgs/${orgId}/values`);
          const n = q.trim().toLowerCase();
          setItems(r.items.filter((v) => !n || v.nameVi.toLowerCase().includes(n)).map((v) => ({ id: v.id, type: 'CULTURE_VALUE', title: v.nameVi, status: null })));
        } else {
          const qs = q.trim().length >= 2 ? `&q=${encodeURIComponent(q.trim())}` : '';
          const r = await api<{ items: Item[] }>(`/orgs/${orgId}/${group}?pageSize=20&sort=updated_desc${qs}`);
          setItems(r.items);
        }
      } catch {
        setItems([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [open, q, group, orgId]);

  useEffect(() => {
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const shown = items.filter((i) => !exclude.has(i.id)).slice(0, 10);
  return (
    <div ref={box} className="relative">
      {open ? (
        <label className="flex min-h-9 items-center gap-2 rounded-md border border-primary bg-canvas-white px-2">
          <Search size={16} strokeWidth={1.5} className="text-ink-mute" aria-hidden />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên" aria-label={`Tìm ${LABEL[group].toLowerCase()}`} className="w-48 bg-transparent py-1 text-body-md outline-none" />
        </label>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-dashed border-hairline-strong px-3 text-body-md text-ink-mute hover:border-primary hover:text-primary">
          <Plus size={16} strokeWidth={1.5} aria-hidden />
          Thêm
        </button>
      )}
      {open && (
        <ul className="absolute left-0 top-full z-20 mt-1 max-h-72 w-80 overflow-y-auto rounded-md border border-hairline bg-canvas-white py-1 shadow-card">
          {shown.length === 0 ? (
            <li className="px-3 py-2 text-body-md text-ink-mute">Không có mục phù hợp.</li>
          ) : (
            shown.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-body-md hover:bg-primary-light"
                  onClick={() => {
                    onPick(i);
                    setOpen(false);
                    setQ('');
                  }}
                >
                  <span className="truncate">{i.title}</span>
                  {i.status && i.status !== 'VERIFIED' && <span className="shrink-0 text-caption text-ink-mute">{STATUS_LABELS[i.status as ContentStatus]}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function RelationsCard({
  orgId,
  collection,
  entityId,
  related,
  canEdit,
  onChange,
}: {
  orgId: string;
  collection: Collection;
  entityId: string;
  related: Related;
  canEdit: boolean;
  onChange: (r: Related) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const groups = ALLOWED[collection].filter((g) => canEdit || related[g].length > 0);

  async function save(group: Group, next: Item[]) {
    const prev = related;
    onChange({ ...related, [group]: next });
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ related: Related }>(`/orgs/${orgId}/${collection}/${entityId}/relations`, {
        method: 'PUT',
        json: { targetType: TARGET[group], ids: next.map((i) => i.id) },
      });
      onChange(r.related);
    } catch (e) {
      onChange(prev);
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-heading-sm">Liên quan</h2>
      {error && <p className="text-caption text-error">{error}</p>}
      {groups.length === 0 ? (
        <p className="text-body-md text-ink-mute">Chưa liên kết với nội dung nào.</p>
      ) : (
        <dl className="flex flex-col gap-4">
          {groups.map((g) => (
            <div key={g}>
              <dt className="pb-1 text-caption font-semibold text-ink-mute">{LABEL[g]}</dt>
              <dd className="flex flex-wrap items-center gap-2">
                {related[g].map((r) => (
                  <span key={r.id} className="inline-flex items-center rounded-md border border-hairline text-body-md">
                    {g === 'values' ? (
                      <span className="px-3 py-1.5 text-primary-dark">{r.title}</span>
                    ) : (
                      <Link href={`/o/${orgId}/${g}/${r.id}`} className="px-3 py-1.5 hover:text-primary">
                        {r.title}
                        {r.status && r.status !== 'VERIFIED' && <span className="text-caption text-ink-mute"> · {STATUS_LABELS[r.status as ContentStatus]}</span>}
                      </Link>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={`Gỡ ${r.title}`}
                        className="border-l border-hairline px-2 py-1.5 text-ink-mute hover:text-error disabled:opacity-50"
                        onClick={() => save(g, related[g].filter((x) => x.id !== r.id))}
                      >
                        <X size={14} strokeWidth={1.5} aria-hidden />
                      </button>
                    )}
                  </span>
                ))}
                {canEdit && !busy && <Picker orgId={orgId} group={g} exclude={new Set(related[g].map((x) => x.id))} onPick={(i) => save(g, [...related[g], i])} />}
                {!canEdit && related[g].length === 0 && <span className="text-body-md text-ink-mute">Chưa có</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
