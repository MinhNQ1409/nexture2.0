import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, CalendarDays } from 'lucide-react';
import { getEntity } from '@/lib/queries';
import { eventDate } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEntity('EVENT', (await params).slug);
  return e ? { title: `${e.title} · ${e.companyName} · Culture Atlas`, description: e.summary?.slice(0, 160) } : {};
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEntity('EVENT', (await params).slug);
  if (!e) notFound();
  const values = (e.extra.values as string[] | undefined) ?? [];
  const when = eventDate(e.sortDate, e.datePrecision, e.endDate, e.endDatePrecision);

  return (
    <article className="mx-auto flex max-w-reading flex-col gap-6">
      <Link href={`/companies/${e.companySlug}`} className="inline-flex items-center gap-2 text-body-md text-link hover:text-link-hover">
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
        {e.companyName}
      </Link>
      <header className="flex flex-col gap-3">
        {e.subtitle && <p className="text-body-md font-medium text-primary">{e.subtitle}</p>}
        <h1 className="text-display-md md:text-display-lg">{e.title}</h1>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-body-md text-ink-mute">
          {when && (
            <li className="inline-flex items-center gap-2">
              <CalendarDays size={16} strokeWidth={1.5} aria-hidden />
              {when}
            </li>
          )}
          <li className="inline-flex items-center gap-2">
            <Building2 size={16} strokeWidth={1.5} aria-hidden />
            {e.companyName}
          </li>
        </ul>
      </header>
      {e.summary && <p className="text-body-lg text-ink">{e.summary}</p>}
      {/* body_html is sanitized with an allowlist when saved in Hub (core/content/html.ts). */}
      {e.bodyHtml && <div className="rich-text text-body-lg" dangerouslySetInnerHTML={{ __html: e.bodyHtml }} />}
      {values.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-heading-sm">Giá trị liên quan</h2>
          <ul className="flex flex-wrap gap-2">
            {values.map((v) => (
              <li key={v} className="rounded-full bg-primary-light px-3 py-1 text-body-md text-primary">{v}</li>
            ))}
          </ul>
        </section>
      )}
      {e.sources.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-hairline pt-4">
          <h2 className="text-heading-sm">Nguồn</h2>
          <ul className="flex flex-col gap-1 text-body-md text-ink-mute">
            {e.sources.map((s) => (
              <li key={s.title}>{s.url ? <a href={s.url} rel="noopener nofollow" target="_blank" className="text-link underline">{s.title}</a> : s.title}{s.note ? ` · ${s.note}` : ''}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
