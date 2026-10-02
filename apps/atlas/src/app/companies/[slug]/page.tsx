import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Building2, CalendarDays, ExternalLink, MapPin, UserRound } from 'lucide-react';
import Link from 'next/link';
import { getCompany, getCompanyEntities, type EntityCard } from '@/lib/queries';
import { RelatedCard } from '../../entity-view';
import { eventDate } from '@/lib/dates';
import { getT, type Lang } from '@/lib/i18n';

// Rendered per request so builds never need the database; data itself is cached by tag in lib/queries.ts.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { lang, t } = await getT();
  const c = await getCompany((await params).slug, lang);
  return c ? { title: `${c.name} · ${t.companyMetaSuffix} · Culture Atlas`, description: c.shortDesc?.slice(0, 160) } : {};
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { lang, t } = await getT();
  const c = await getCompany((await params).slug, lang);
  if (!c) notFound();
  const all = await getCompanyEntities(c.orgId, c.slug, lang);
  const of = (...types: string[]) => all.filter((e) => types.includes(e.entityType));
  const events = of('EVENT');
  const featured = c.featuredStorySlug ? all.find((e) => e.entityType === 'STORY' && e.slug === c.featuredStorySlug) : undefined;
  const stories = of('STORY')
    .filter((e) => e !== featured)
    .sort((x, y) => (y.sortDate ?? '').localeCompare(x.sortDate ?? ''));
  // 07 §3: founders first, then by name.
  const people = of('PERSON').sort((x, y) => Number(y.extra.isFounder === true) - Number(x.extra.isFounder === true) || x.title.localeCompare(y.title, lang));
  const products = of('PRODUCT', 'PROJECT').sort((x, y) => (y.sortDate ?? '').localeCompare(x.sortDate ?? ''));
  const nav = [
    (featured || stories.length > 0) && ['cau-chuyen', t.stories],
    events.length > 0 && ['dong-thoi-gian', t.timeline],
    people.length > 0 && ['con-nguoi', t.people],
    products.length > 0 && ['san-pham', t.productsProjects],
    c.cultureValues.length > 0 && ['gia-tri', t.values],
  ].filter(Boolean) as [string, string][];
  const facts = [
    c.industryName && { icon: Building2, text: c.industryName },
    c.foundedYear && { icon: CalendarDays, text: t.founded(c.foundedYear) },
    c.provinceName && { icon: MapPin, text: c.provinceName },
  ].filter(Boolean) as { icon: typeof Building2; text: string }[];

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 rounded-xl border border-hairline bg-canvas-white p-6 shadow-card md:flex-row md:items-center md:p-8">
        {c.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img fetchPriority="high" src={c.logoUrl} alt={c.name} className="size-24 shrink-0 rounded-lg object-contain" />
        ) : (
          <span className="inline-flex size-24 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Building2 size={32} strokeWidth={1.5} aria-hidden />
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-display-md md:text-display-lg">{c.name}</h1>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-body-md text-ink-mute">
            {facts.map((f) => (
              <li key={f.text} className="inline-flex items-center gap-2">
                <f.icon size={16} strokeWidth={1.5} aria-hidden />
                {f.text}
              </li>
            ))}
            {c.website && (
              <li>
                <a href={c.website} rel="noopener nofollow" target="_blank" className="inline-flex items-center gap-2 text-link underline hover:text-link-hover">
                  Website
                  <ExternalLink size={16} strokeWidth={1.5} aria-hidden />
                </a>
              </li>
            )}
          </ul>
        </div>
      </header>

      {c.shortDesc && <p className="max-w-reading text-body-lg">{c.shortDesc}</p>}

      {nav.length > 1 && (
        <nav aria-label={t.sectionNav} className="sticky top-topbar z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-hairline bg-canvas px-4 py-2">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-md px-3 py-1.5 text-body-md text-ink-mute hover:bg-canvas-section hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
      )}

      {featured && (
        <section id="cau-chuyen" className="flex scroll-mt-32 flex-col gap-3 rounded-xl border-l-4 border-primary bg-canvas-white p-6 shadow-card md:p-8">
          {featured.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img fetchPriority="high" src={featured.coverUrl} alt={featured.coverAlt ?? ''} className="aspect-[21/9] w-full rounded-lg object-cover" />
          )}
          <p className="text-body-md font-medium text-primary">{t.companyStory}</p>
          <h2 className="text-heading-lg">{featured.title}</h2>
          {featured.summary && <p className="max-w-reading text-body-lg text-ink-mute">{featured.summary}</p>}
          <Link href={`/stories/${featured.slug}`} className="inline-flex w-fit items-center gap-2 text-body-md font-semibold text-primary hover:text-primary-dark">
            {t.readStory}
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
          </Link>
        </section>
      )}

      {c.cultureValues.length > 0 && (
        <section id="gia-tri" className="flex scroll-mt-32 flex-col gap-4">
          <h2 className="text-heading-lg">{t.coreValues}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.cultureValues.map((v) => (
              <li key={v.name} className="rounded-lg border-l-4 border-primary bg-canvas-white p-5 shadow-card">
                <p className="font-display text-heading-sm">{v.name}</p>
                {v.description && <p className="mt-1 text-body-md text-ink-mute">{v.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {events.length > 0 && (
        <section id="dong-thoi-gian" className="flex scroll-mt-32 flex-col gap-4">
          <h2 className="text-heading-lg">{t.timeline}</h2>
          <ol className="flex flex-col gap-4 border-l-2 border-hairline pl-6">
            {events.map((e) => (
              <li key={e.slug} className="relative">
                <span className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-primary" aria-hidden />
                <p className="text-body-md text-ink-mute">{eventDate(e.sortDate, e.datePrecision, null, null, lang)}{e.subtitle ? ` · ${e.subtitle}` : ''}</p>
                <Link href={`/events/${e.slug}`} className="font-display text-heading-sm text-ink hover:text-primary">{e.title}</Link>
                {e.summary && <p className="mt-1 max-w-reading text-body-md text-ink-mute">{e.summary}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {people.length > 0 && (
        <section id="con-nguoi" className="flex scroll-mt-32 flex-col gap-4">
          <h2 className="text-heading-lg">{t.foundersAndPeople}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <li key={p.id}>
                <Link href={`/people/${p.slug}`} className="flex h-full items-center gap-4 rounded-lg border border-hairline bg-canvas-white p-5 shadow-card hover:bg-canvas-section">
                  {p.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverUrl} alt="" loading="lazy" className="size-12 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                      <UserRound size={24} strokeWidth={1.5} aria-hidden />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-display text-heading-sm text-ink">{p.title}</span>
                    <span className="block text-body-md text-ink-mute">{[p.extra.isFounder === true && t.founder, p.subtitle].filter(Boolean).join(' · ')}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {products.length > 0 && <CardGrid id="san-pham" title={t.productsAndProjects} items={products} lang={lang} />}
      {stories.length > 0 && <CardGrid id={featured ? 'cau-chuyen-van-hoa' : 'cau-chuyen'} title={t.cultureStories} items={stories} lang={lang} />}
    </article>
  );
}

function CardGrid({ id, title, items, lang }: { id: string; title: string; items: EntityCard[]; lang: Lang }) {
  return (
    <section id={id} className="flex scroll-mt-32 flex-col gap-4">
      <h2 className="text-heading-lg">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <RelatedCard key={e.id} e={e} lang={lang} />
        ))}
      </div>
    </section>
  );
}
