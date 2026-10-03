'use client';
// Culture Timeline (06 §8): events on a vertical axis grouped by year; click opens a read-only drawer.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CalendarClock, ExternalLink, Plus, X } from 'lucide-react';
import { EVENT_TYPE_LABELS, EVENT_TYPES, formatFuzzyDate, type EventType } from '@nexture/contracts';
import { StatusBadge } from '@/components/badges';
import { Html } from '@/components/content-editor';
import { Button, Card, PageHeader, Select, cx, linkButton } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';
import type { TimelineItem } from '@nexture/core';

type Year = { year: number; items: TimelineItem[] };
type Opt = { id: string; name: string };
type Rel = { id: string; title: string };
type Detail = {
  id: string;
  titleVi: string;
  eventType: EventType;
  summaryVi: string | null;
  contentVi: string | null;
  startDate: TimelineItem['date'];
  endDate: TimelineItem['endDate'];
  cover: { url: string; title: string } | null;
  media: { id: string; kind: string; url: string; title: string; caption: string | null }[];
  related: { stories: Rel[]; people: Rel[]; products: Rel[]; values: Rel[] };
};

/** Dot colour per event type; tokens only. */
const DOT: Record<EventType, string> = {
  FOUNDING: 'bg-primary',
  MILESTONE: 'bg-surface-dark',
  PRODUCT_LAUNCH: 'bg-accent',
  ACHIEVEMENT: 'bg-primary-dark',
  EXPANSION: 'bg-ink-mute',
  CULTURE_ACTIVITY: 'bg-accent-dark',
  PARTNERSHIP: 'bg-ink',
  OTHER: 'bg-ink-subtle',
};

export function TimelineView({ orgId, canSeeUnverified, canCreate, initial, people, values }: { orgId: string; canSeeUnverified: boolean; canCreate: boolean; initial: Year[]; people: Opt[]; values: Opt[] }) {
  const [years, setYears] = useState(initial);
  const [eventType, setEventType] = useState('');
  const [personId, setPersonId] = useState('');
  const [valueId, setValueId] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const sp = new URLSearchParams();
    if (eventType) sp.set('eventType', eventType);
    if (personId) sp.set('personId', personId);
    if (valueId) sp.set('valueId', valueId);
    if (unverified) sp.set('includeUnverified', 'true');
    api<{ years: Year[] }>(`/orgs/${orgId}/timeline?${sp}`)
      .then((r) => setYears(r.years))
      .catch((e: ApiError) => setError(e.message));
  }, [orgId, eventType, personId, valueId, unverified]);

  const filtered = Boolean(eventType || personId || valueId);
  // Alternate sides across the whole axis, not per year.
  const side = new Map(years.flatMap((y) => y.items).map((e, i) => [e.id, i % 2]));
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Culture Timeline"
        description="Hành trình của doanh nghiệp qua các sự kiện, theo từng năm."
        action={
          canCreate && (
            <Link href={`/o/${orgId}/events/new`} className={linkButton()}>
              <Plus size={16} strokeWidth={1.5} aria-hidden />
              Thêm sự kiện
            </Link>
          )
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-48">
          <Select aria-label="Loại sự kiện" value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="">Mọi loại sự kiện</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select aria-label="Người liên quan" value={personId} onChange={(e) => setPersonId(e.target.value)}>
            <option value="">Mọi người</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select aria-label="Giá trị văn hóa" value={valueId} onChange={(e) => setValueId(e.target.value)}>
            <option value="">Mọi giá trị</option>
            {values.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
        {canSeeUnverified && (
          <label className="flex min-h-11 items-center gap-2 text-body-md">
            <input type="checkbox" className="accent-primary" checked={unverified} onChange={(e) => setUnverified(e.target.checked)} />
            Hiện cả nội dung chưa xác minh
          </label>
        )}
      </div>
      {error && <p className="text-body-md text-error">{error}</p>}

      {years.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <CalendarClock size={40} strokeWidth={1.5} className="text-ink-mute" aria-hidden />
          <p className="text-body-md text-ink-mute">{filtered ? 'Không có sự kiện nào phù hợp với bộ lọc.' : 'Chưa có sự kiện nào trên dòng thời gian.'}</p>
          {canCreate && !filtered && (
            <Link href={`/o/${orgId}/events/new`} className={linkButton()}>
              <Plus size={16} strokeWidth={1.5} aria-hidden />
              Thêm sự kiện
            </Link>
          )}
        </Card>
      ) : (
        <div className="relative flex flex-col gap-8 pl-8 md:pl-0">
          <span className="absolute bottom-0 left-3 top-0 w-0.5 bg-hairline md:left-1/2 md:-translate-x-1/2" aria-hidden />
          {years.map((y) => (
            <section key={y.year} className="flex flex-col gap-4">
              <h2 className="relative z-[1] w-fit rounded-pill bg-canvas px-3 font-display text-display-md md:mx-auto">{y.year}</h2>
              <ol className="flex flex-col gap-4">
                {y.items.map((e) => (
                  <li key={e.id} className={cx('relative md:w-1/2', side.get(e.id) === 0 ? 'md:pr-8' : 'md:ml-auto md:pl-8')}>
                    <span
                      className={cx('absolute top-5 size-3 rounded-full ring-4 ring-canvas', DOT[e.eventType], '-left-[26px]', side.get(e.id) === 0 ? 'md:left-auto md:-right-1.5' : 'md:-left-1.5')}
                      aria-hidden
                    />
                    <button type="button" onClick={() => setOpen(e.id)} className="flex w-full gap-3 rounded-lg border border-hairline bg-canvas-white p-4 text-left shadow-card transition-colors hover:border-primary">
                      {e.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img loading="lazy" decoding="async" src={e.thumbnailUrl} alt="" className="size-16 shrink-0 rounded-md object-cover" />
                      )}
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-caption text-ink-mute">
                          {formatFuzzyDate(e.date)}
                          {e.endDate && ` – ${formatFuzzyDate(e.endDate)}`} · {EVENT_TYPE_LABELS[e.eventType]}
                        </span>
                        <span className="font-semibold">{e.title}</span>
                        {e.summary && <span className="line-clamp-2 text-body-md text-ink-mute">{e.summary}</span>}
                        <span className="flex flex-wrap items-center gap-2">
                          {e.status !== 'VERIFIED' && <StatusBadge status={e.status} />}
                          {e.people.length > 0 && <Avatars people={e.people} />}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
      {open && <Drawer orgId={orgId} id={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Avatars({ people }: { people: TimelineItem['people'] }) {
  return (
    <span className="flex items-center" title={people.map((p) => p.name).join(', ')}>
      {people.slice(0, 3).map((p) =>
        p.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" decoding="async" key={p.id} src={p.avatarUrl} alt={p.name} className="-ml-1 size-6 rounded-full border-2 border-canvas-white object-cover first:ml-0" />
        ) : (
          <span key={p.id} className="-ml-1 flex size-6 items-center justify-center rounded-full border-2 border-canvas-white bg-primary-light text-[11px] font-semibold text-primary first:ml-0" aria-label={p.name}>
            {p.name.trim().split(/\s+/).at(-1)?.[0]}
          </span>
        ),
      )}
      {people.length > 3 && <span className="ml-1 text-caption text-ink-mute">+{people.length - 3}</span>}
    </span>
  );
}

function Drawer({ orgId, id, onClose }: { orgId: string; id: string; onClose: () => void }) {
  const [e, setE] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setE(null);
    api<Detail>(`/orgs/${orgId}/events/${id}`)
      .then(setE)
      .catch((x: ApiError) => setError(x.message));
  }, [orgId, id]);
  useEffect(() => {
    const esc = (ev: KeyboardEvent) => ev.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const groups: [keyof Detail['related'], string, string][] = [
    ['stories', 'Câu chuyện', 'stories'],
    ['people', 'Con người', 'people'],
    ['products', 'Sản phẩm & Dự án', 'products'],
  ];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true" aria-label="Chi tiết sự kiện" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <aside className="flex h-full w-full max-w-xl flex-col gap-4 overflow-y-auto bg-canvas-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {e && (
              <p className="text-caption text-ink-mute">
                {formatFuzzyDate(e.startDate)}
                {e.endDate && ` – ${formatFuzzyDate(e.endDate)}`} · {EVENT_TYPE_LABELS[e.eventType]}
              </p>
            )}
            <h2 className="text-heading-lg">{e?.titleVi ?? 'Đang tải'}</h2>
          </div>
          <Button variant="ghost" size="sm" aria-label="Đóng" onClick={onClose}>
            <X size={20} strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
        {error && <p className="text-body-md text-error">{error}</p>}
        {e && (
          <>
            {e.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async" src={e.cover.url} alt={e.cover.title} className="aspect-[16/9] w-full rounded-md object-cover" />
            )}
            {e.summaryVi && <p className="text-body-lg">{e.summaryVi}</p>}
            <Html html={e.contentVi} />
            {groups.map(([k, label, href]) =>
              e.related[k].length ? (
                <section key={k} className="flex flex-col gap-1">
                  <h3 className="text-heading-sm">{label}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {e.related[k].map((r) => (
                      <li key={r.id}>
                        <Link href={`/o/${orgId}/${href}/${r.id}`} className="rounded-pill bg-canvas-section px-3 py-1 text-body-md hover:text-primary">
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null,
            )}
            {e.related.values.length > 0 && (
              <section className="flex flex-col gap-1">
                <h3 className="text-heading-sm">Giá trị thể hiện</h3>
                <ul className="flex flex-wrap gap-2">
                  {e.related.values.map((v) => (
                    <li key={v.id} className="rounded-pill bg-primary-light px-3 py-1 text-body-md text-primary">
                      {v.title}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {e.media.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="text-heading-sm">Ảnh &amp; video</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {e.media.map((m) => (
                    <li key={m.id}>
                      {m.kind === 'IMAGE' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img loading="lazy" decoding="async" src={m.url} alt={m.caption ?? m.title} className="aspect-[4/3] w-full rounded-md object-cover" />
                      ) : (
                        <video src={m.url} controls preload="metadata" className="aspect-[4/3] w-full rounded-md" />
                      )}
                      {m.caption && <p className="text-caption text-ink-mute">{m.caption}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <Link href={`/o/${orgId}/events/${e.id}`} className={cx(linkButton('secondary'), 'w-fit')}>
              Mở trang chi tiết
              <ExternalLink size={16} strokeWidth={1.5} aria-hidden />
            </Link>
          </>
        )}
      </aside>
    </div>
  );
}
