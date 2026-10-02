'use client';
// Atlas preview (06 §7.1): the item laid out as the Atlas detail page, inside a mock browser frame.
import { useEffect, useState } from 'react';
import { Building2, CalendarDays, Lock, TriangleAlert } from 'lucide-react';
import { formatFuzzyDate, type DatePrecision } from '@nexture/contracts';
import { api, type ApiError } from '@/lib/fetcher';
import { proseClass } from './rich-text';
import { Button, Dialog, cx } from './ui';

type Preview = {
  url: string;
  path: string;
  entityType: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyShortDesc: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  bodyHtml: string | null;
  extra: Record<string, unknown>;
  sortDate: string | null;
  datePrecision: string | null;
  endDate: string | null;
  endDatePrecision: string | null;
  cover: { url: string; alt: string } | null;
  gallery: { id: string; url: string; kind: string; title: string; caption: string | null }[];
  related: { id: string; entityType: string; title: string; subtitle: string | null; coverUrl: string | null }[];
  sources: { title: string; url: string | null; note: string | null }[];
  warnings: string[];
};

const GROUPS: [string[], string][] = [
  [['PERSON'], 'Con người'],
  [['EVENT'], 'Sự kiện'],
  [['STORY'], 'Câu chuyện'],
  [['PRODUCT', 'PROJECT'], 'Sản phẩm & Dự án'],
];

function when(p: Preview) {
  if (!p.sortDate) return '';
  const f = (date: string, precision: string | null) => formatFuzzyDate({ date, precision: (precision ?? 'DAY') as DatePrecision });
  return p.endDate ? `${f(p.sortDate, p.datePrecision)} – ${f(p.endDate, p.endDatePrecision)}` : f(p.sortDate, p.datePrecision);
}

/** `onPublish` turns the dialog into the confirm step before making the item public. */
export function PreviewDialog({ orgId, collection, id, onClose, onPublish }: { orgId: string; collection: string; id: string; onClose: () => void; onPublish?: () => void }) {
  const [p, setP] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<Preview>(`/orgs/${orgId}/${collection}/${id}/public-preview`).then(setP, (e) => setError((e as ApiError).message));
  }, [orgId, collection, id]);

  const isPerson = p?.entityType === 'PERSON';
  const values = (p?.extra.values as string[] | undefined) ?? [];
  const contributions = p?.extra.contributionsHtml as string | null | undefined;
  return (
    <Dialog title={onPublish ? 'Xem trước trước khi công khai' : 'Xem trước trên Atlas'} onClose={onClose} wide>
      {error && <p className="text-body-md text-error">{error}</p>}
      {!p && !error && <p className="text-body-md text-ink-mute">Đang tải</p>}
      {p && (
        <>
          {p.warnings.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-md bg-warning-bg p-3 text-body-md text-warning">
              {p.warnings.map((w) => (
                <li key={w} className="flex items-start gap-2">
                  <TriangleAlert size={16} strokeWidth={1.5} aria-hidden className="mt-1 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          )}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-hairline-strong">
            <div className="flex items-center gap-2 border-b border-hairline bg-canvas-section px-3 py-2">
              <span className="flex gap-1" aria-hidden>
                <span className="size-2.5 rounded-full bg-hairline-strong" />
                <span className="size-2.5 rounded-full bg-hairline-strong" />
                <span className="size-2.5 rounded-full bg-hairline-strong" />
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-2 rounded-pill bg-canvas-white px-3 py-1 text-caption text-ink-mute">
                <Lock size={12} strokeWidth={1.5} aria-hidden />
                <span className="truncate">{p.url.replace(/^https?:\/\//, '')}</span>
              </span>
            </div>
            <div className="overflow-y-auto bg-canvas-white px-4 py-6 md:px-8">
              <article className="mx-auto flex w-full max-w-reading flex-col gap-6">
                <p className="text-body-md text-link">← {p.companyName}</p>
                {p.cover && !isPerson && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img loading="lazy" decoding="async" src={p.cover.url} alt={p.cover.alt} className="aspect-[16/9] w-full rounded-lg object-cover" />
                )}
                <header className="flex flex-col gap-3">
                  {p.cover && isPerson && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" decoding="async" src={p.cover.url} alt={p.cover.alt} className="size-32 rounded-full object-cover" />
                  )}
                  {p.subtitle && <p className="text-body-md font-medium text-primary">{p.subtitle}</p>}
                  <h1 className="text-display-md">{p.title}</h1>
                  <ul className="flex flex-wrap gap-x-5 gap-y-2 text-body-md text-ink-mute">
                    {when(p) && (
                      <li className="inline-flex items-center gap-2">
                        <CalendarDays size={16} strokeWidth={1.5} aria-hidden />
                        {when(p)}
                      </li>
                    )}
                    <li className="inline-flex items-center gap-2">
                      <Building2 size={16} strokeWidth={1.5} aria-hidden />
                      {p.companyName}
                    </li>
                  </ul>
                </header>
                {p.summary && <p className="text-body-lg text-ink">{p.summary}</p>}
                {p.bodyHtml && <div className={cx(proseClass, 'text-body-lg')} dangerouslySetInnerHTML={{ __html: p.bodyHtml }} />}
                {contributions && (
                  <section className="flex flex-col gap-2">
                    <h2 className="text-heading-md">Đóng góp</h2>
                    <div className={proseClass} dangerouslySetInnerHTML={{ __html: contributions }} />
                  </section>
                )}
                {p.gallery.length > 0 && (
                  <section className="flex flex-col gap-3">
                    <h2 className="text-heading-md">Hình ảnh</h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {p.gallery.map((m) => (
                        <li key={m.id}>
                          <figure className="flex flex-col gap-1">
                            {m.kind === 'VIDEO' ? (
                              <video src={m.url} controls preload="metadata" className="aspect-[4/3] w-full rounded-md bg-canvas-section object-cover" />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img loading="lazy" decoding="async" src={m.url} alt={m.caption ?? m.title} className="aspect-[4/3] w-full rounded-md object-cover" />
                            )}
                            {m.caption && <figcaption className="text-caption text-ink-mute">{m.caption}</figcaption>}
                          </figure>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {values.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <h2 className="text-heading-sm">Giá trị thể hiện</h2>
                    <ul className="flex flex-wrap gap-2">
                      {values.map((v) => (
                        <li key={v} className="rounded-full bg-primary-light px-3 py-1 text-body-md text-primary">
                          {v}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {GROUPS.map(([types, title]) => {
                  const items = p.related.filter((r) => types.includes(r.entityType));
                  if (!items.length) return null;
                  return (
                    <section key={title} className="flex flex-col gap-3">
                      <h2 className="text-heading-md">{title}</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((r) => (
                          <div key={r.id} className="flex flex-col gap-1 rounded-lg border border-hairline p-4 shadow-card">
                            {r.subtitle && <span className="text-caption text-ink-mute">{r.subtitle}</span>}
                            <span className="font-display text-heading-sm">{r.title}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
                {p.sources.length > 0 && (
                  <section className="flex flex-col gap-2 border-t border-hairline pt-4">
                    <h2 className="text-heading-sm">Nguồn</h2>
                    <ul className="flex flex-col gap-1 text-body-md text-ink-mute">
                      {p.sources.map((s) => (
                        <li key={s.title}>
                          {s.url ? <span className="text-link underline">{s.title}</span> : s.title}
                          {s.note ? ` · ${s.note}` : ''}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <div className="flex items-center gap-4 rounded-lg border border-hairline p-5 shadow-card">
                  {p.companyLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" decoding="async" src={p.companyLogoUrl} alt="" className="size-14 shrink-0 rounded-md object-contain" />
                  ) : (
                    <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary">
                      <Building2 size={24} strokeWidth={1.5} aria-hidden />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-caption text-ink-mute">Về doanh nghiệp</span>
                    <span className="block font-display text-heading-sm">{p.companyName}</span>
                    {p.companyShortDesc && <span className="line-clamp-2 block text-body-md text-ink-mute">{p.companyShortDesc}</span>}
                  </span>
                </div>
              </article>
            </div>
          </div>
          <p className="text-caption text-ink-mute">Ghi chú nội bộ, người tạo và trạng thái duyệt không bao giờ hiện trên Atlas. Chỉ nội dung liên quan đã công khai mới được liên kết.</p>
        </>
      )}
      <div className="flex justify-end gap-2">
        {onPublish ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button disabled={!p} onClick={onPublish}>
              Công khai
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        )}
      </div>
    </Dialog>
  );
}
