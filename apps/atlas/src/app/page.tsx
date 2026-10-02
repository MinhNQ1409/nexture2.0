import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getHome, type EntityCard } from '@/lib/queries';
import { getT } from '@/lib/i18n';
import { CompanyCard } from './company-card';
import { RelatedCard } from './entity-view';
import { SearchBox } from './search-box';

// Rendered per request so builds never need the database; data itself is cached by tag in lib/queries.ts.
export const dynamic = 'force-dynamic';

function Block({ title, href, more, children }: { title: string; href: string; more: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading-lg">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-2 text-body-md font-semibold text-primary hover:text-primary-dark">
          {more}
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Entities({ items, lang }: { items: EntityCard[]; lang: 'vi' | 'en' }) {
  return items.map((e) => (
    <div key={e.id} className="flex flex-col gap-1">
      <RelatedCard e={e} lang={lang} />
      {e.companyName && <span className="px-1 text-caption text-ink-mute">{e.companyName}</span>}
    </div>
  ));
}

export default async function Home() {
  const { lang, t } = await getT();
  const h = await getHome(lang);
  const B = (p: { title: string; href: string; children: React.ReactNode }) => <Block {...p} more={t.seeAll} />;
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="max-w-[900px] text-display-lg md:text-display-xl">Vietnam Enterprise Culture Atlas</h1>
        <p className="max-w-reading text-body-lg text-ink-mute">{t.siteDesc}</p>
        <SearchBox large t={t} />
        <p className="tabular text-caption text-ink-mute">
          {t.companiesN(h.totals.companies.toLocaleString(t.locale))} · {t.storiesN(h.totals.stories.toLocaleString(t.locale))}
        </p>
      </section>
      {h.featured.length > 0 && (
        <B title={t.featuredCompanies} href="/companies">
          {h.featured.map((c) => (
            <CompanyCard key={c.slug} c={c} t={t} />
          ))}
        </B>
      )}
      {h.stories.length > 0 && (
        <B title={t.featuredStories} href="/search?type=story">
          <Entities items={h.stories} lang={lang} />
        </B>
      )}
      {h.people.length > 0 && (
        <B title={t.foundersPeople} href="/search?type=person">
          <Entities items={h.people} lang={lang} />
        </B>
      )}
      {h.products.length > 0 && (
        <B title={t.productsProjects} href="/search?type=product">
          <Entities items={h.products} lang={lang} />
        </B>
      )}
      {h.newest.length > 0 && (
        <B title={t.newestCompanies} href="/companies">
          {h.newest.map((c) => (
            <CompanyCard key={c.slug} c={c} t={t} />
          ))}
        </B>
      )}
    </div>
  );
}
