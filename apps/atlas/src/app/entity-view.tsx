// Detail page shared by stories, events, people, products and projects (07 §4–7).
import Link from 'next/link';
import { ArrowLeft, Building2, CalendarDays } from 'lucide-react';
import type { ReactNode } from 'react';
import { eventDate } from '@/lib/dates';
import { entityHref, getCompany, getGallery, getRelated, type EntityCard } from '@/lib/queries';
import { getT, type Dict, type Lang } from '@/lib/i18n';

type Entity = {
  id: string;
  entityType: string;
  companySlug: string;
  companyName: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  bodyHtml: string | null;
  extra: Record<string, unknown>;
  sortDate: string | null;
  datePrecision: string | null;
  endDate: string | null;
  endDatePrecision: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  sources: { title: string; url: string | null; note: string | null }[];
};

const GROUPS: [string[], keyof Dict][] = [
  [['PERSON'], 'people'],
  [['EVENT'], 'events'],
  [['STORY'], 'stories'],
  [['PRODUCT', 'PROJECT'], 'productsProjects'],
];

export function RelatedCard({ e, lang }: { e: EntityCard; lang: Lang }) {
  const when = eventDate(e.sortDate, e.datePrecision, null, null, lang);
  return (
    <Link href={entityHref(e.entityType, e.slug)} className="flex flex-col gap-1 overflow-hidden rounded-lg border border-hairline bg-canvas-white p-4 shadow-card transition-colors duration-[120ms] hover:bg-canvas-section">
      {e.coverUrl &&
        (e.entityType === 'PERSON' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.coverUrl} alt="" loading="lazy" decoding="async" className="mb-2 size-16 rounded-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.coverUrl} alt="" loading="lazy" decoding="async" className="-mx-4 -mt-4 mb-2 aspect-[16/9] w-[calc(100%+2rem)] max-w-none object-cover" />
        ))}
      <span className="text-caption text-ink-mute">{[e.subtitle, e.entityType !== 'PERSON' && when].filter(Boolean).join(' · ')}</span>
      <span className="font-display text-heading-sm text-ink">{e.title}</span>
      {e.summary && <span className="line-clamp-2 text-body-md text-ink-mute">{e.summary}</span>}
    </Link>
  );
}

export async function EntityView({ e, label, meta, children }: { e: Entity; label?: string | null; meta?: ReactNode; children?: ReactNode }) {
  const { lang, t } = await getT();
  const [related, company, gallery] = await Promise.all([getRelated(e.id, e.companySlug, lang), getCompany(e.companySlug, lang), getGallery(e.id, e.companySlug)]);
  const values = (e.extra.values as string[] | undefined) ?? [];
  const when = eventDate(e.sortDate, e.datePrecision, e.endDate, e.endDatePrecision, lang);

  return (
    <article className="mx-auto flex w-full max-w-reading flex-col gap-6">
      <Link href={`/companies/${e.companySlug}`} className="inline-flex w-fit items-center gap-2 text-body-md text-link hover:text-link-hover">
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
        {e.companyName}
      </Link>
      {e.coverUrl && e.entityType !== 'PERSON' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img fetchPriority="high" src={e.coverUrl} alt={e.coverAlt ?? ''} className="aspect-[16/9] w-full rounded-lg object-cover" />
      )}
      <header className="flex flex-col gap-3">
        {e.coverUrl && e.entityType === 'PERSON' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img fetchPriority="high" src={e.coverUrl} alt={e.coverAlt ?? e.title} className="size-32 rounded-full object-cover" />
        )}
        {label && <p className="text-body-md font-medium text-primary">{label}</p>}
        <h1 className="text-display-md md:text-display-lg">{e.title}</h1>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-body-md text-ink-mute">
          {meta ??
            (when && (
              <li className="inline-flex items-center gap-2">
                <CalendarDays size={16} strokeWidth={1.5} aria-hidden />
                {when}
              </li>
            ))}
          <li className="inline-flex items-center gap-2">
            <Building2 size={16} strokeWidth={1.5} aria-hidden />
            <Link href={`/companies/${e.companySlug}`} className="hover:text-primary">
              {e.companyName}
            </Link>
          </li>
        </ul>
      </header>
      {e.summary && <p className="text-body-lg text-ink">{e.summary}</p>}
      {/* body_html is sanitized with an allowlist when saved in Hub (core/content/html.ts). */}
      {e.bodyHtml && <div className="rich-text text-body-lg" dangerouslySetInnerHTML={{ __html: e.bodyHtml }} />}
      {children}
      {gallery.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-heading-md">{t.images}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {gallery.map((m) => (
              <li key={m.id}>
                <figure className="flex flex-col gap-1">
                  {m.kind === 'VIDEO' ? (
                    <video src={m.url} controls preload="metadata" className="aspect-[4/3] w-full rounded-md bg-canvas-section object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.alt ?? m.caption ?? m.title} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" />
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
          <h2 className="text-heading-sm">{t.valuesShown}</h2>
          <ul className="flex flex-wrap gap-2">
            {values.map((v) => (
              <li key={v} className="rounded-full bg-primary-light px-3 py-1 text-body-md text-primary">
                {v}
              </li>
            ))}
          </ul>
        </section>
      )}
      {GROUPS.map(([types, key]) => {
        const title = t[key] as string;
        const items = related.filter((r) => types.includes(r.entityType));
        if (!items.length) return null;
        return (
          <section key={title} className="flex flex-col gap-3">
            <h2 className="text-heading-md">{title}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((r) => (
                <RelatedCard key={r.id} e={r} lang={lang} />
              ))}
            </div>
          </section>
        );
      })}
      {e.sources.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-hairline pt-4">
          <h2 className="text-heading-sm">{t.sources}</h2>
          <ul className="flex flex-col gap-1 text-body-md text-ink-mute">
            {e.sources.map((s) => (
              <li key={s.title}>
                {s.url ? (
                  <a href={s.url} rel="noopener nofollow" target="_blank" className="text-link underline">
                    {s.title}
                  </a>
                ) : (
                  s.title
                )}
                {s.note ? ` · ${s.note}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
      {company && (
        <Link href={`/companies/${company.slug}`} className="flex items-center gap-4 rounded-lg border border-hairline bg-canvas-white p-5 shadow-card hover:bg-canvas-section">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" decoding="async" src={company.logoUrl} alt="" className="size-14 shrink-0 rounded-md object-contain" />
          ) : (
            <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary">
              <Building2 size={24} strokeWidth={1.5} aria-hidden />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-caption text-ink-mute">{t.aboutCompany}</span>
            <span className="block font-display text-heading-sm">{company.name}</span>
            {company.shortDesc && <span className="line-clamp-2 block text-body-md text-ink-mute">{company.shortDesc}</span>}
          </span>
        </Link>
      )}
    </article>
  );
}
