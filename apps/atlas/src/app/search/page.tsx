// Search (07 §8): grouped results without a type, paged list with one. Rendered per request, never indexed.
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SEARCH_TYPES, searchCompanies, searchEntities, type SearchType } from '@/lib/search';
import { RelatedCard } from '../entity-view';
import { CompanyCard } from '../company-card';
import { SearchBox } from '../search-box';
import { getT, type Dict, type Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.searchTitle} · Culture Atlas`, robots: { index: false, follow: true } };
}

const GROUPS: [SearchType, keyof Dict][] = [
  ['company', 'navCompanies'],
  ['story', 'stories'],
  ['event', 'events'],
  ['person', 'people'],
  ['product', 'productsProjects'],
];
const PAGE = 24;

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().slice(0, 100);
  const type = sp.type && sp.type in SEARCH_TYPES ? (sp.type as SearchType) : null;
  const page = Math.max(1, Number(sp.page) || 1);
  const { lang, t } = await getT();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-display-md">{t.searchTitle}</h1>
        <SearchBox q={q} type={type} t={t} />
        {type && (
          <Link href={`/search?q=${encodeURIComponent(q)}`} className="w-fit text-body-md text-link underline">
            {t.searchAllTypes}
          </Link>
        )}
      </div>
      {type && !q ? (
        <TypeResults q="" type={type} page={page} lang={lang} t={t} />
      ) : !q ? (
        <p className="text-body-md text-ink-mute">{t.searchHint}</p>
      ) : q.length < 2 ? (
        <p className="text-body-md text-ink-mute">{t.searchMin}</p>
      ) : type ? (
        <TypeResults q={q} type={type} page={page} lang={lang} t={t} />
      ) : (
        <Grouped q={q} lang={lang} t={t} />
      )}
    </div>
  );
}

async function run(q: string, type: SearchType, limit: number, offset: number, lang: Lang) {
  const types = SEARCH_TYPES[type];
  if (!types) {
    const r = await searchCompanies(q, limit, offset, lang);
    return { total: r.total, companies: r.items, entities: [] };
  }
  const r = await searchEntities(q, types, limit, offset, lang);
  return { total: r.total, companies: [], entities: r.items };
}

function Results({ r, lang, t }: { r: Awaited<ReturnType<typeof run>>; lang: Lang; t: Dict }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {r.companies.map((c) => (
        <CompanyCard key={c.slug} c={c} t={t} />
      ))}
      {r.entities.map((e) => (
        <div key={e.id} className="flex flex-col gap-1">
          <RelatedCard e={e} lang={lang} />
          <span className="px-1 text-caption text-ink-mute">{e.companyName}</span>
        </div>
      ))}
    </div>
  );
}

async function Grouped({ q, lang, t: d }: { q: string; lang: Lang; t: Dict }) {
  const all = await Promise.all(GROUPS.map(async ([t, key]) => ({ t, label: d[key] as string, r: await run(q, t, 6, 0, lang) })));
  const found = all.filter((g) => g.r.total > 0);
  if (!found.length) return <p className="text-body-md text-ink-mute">{d.noResults(q)}</p>;
  return (
    <>
      {found.map(({ t, label, r }) => (
        <section key={t} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-heading-lg">
              {label} <span className="tabular text-body-md text-ink-mute">({r.total})</span>
            </h2>
            {r.total > 6 && (
              <Link href={`/search?q=${encodeURIComponent(q)}&type=${t}`} className="inline-flex items-center gap-2 text-body-md font-semibold text-primary hover:text-primary-dark">
                {d.seeAll}
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
              </Link>
            )}
          </div>
          <Results r={r} lang={lang} t={d} />
        </section>
      ))}
    </>
  );
}

async function TypeResults({ q, type, page, lang, t }: { q: string; type: SearchType; page: number; lang: Lang; t: Dict }) {
  const r = await run(q, type, PAGE, (page - 1) * PAGE, lang);
  if (!r.total) return <p className="text-body-md text-ink-mute">{q ? t.noResults(q) : t.noContent}</p>;
  const pages = Math.ceil(r.total / PAGE);
  const href = (p: number) => `/search?q=${encodeURIComponent(q)}&type=${type}&page=${p}`;
  return (
    <section className="flex flex-col gap-4">
      <p className="tabular text-body-md text-ink-mute">{q ? t.nResults(r.total) : t.nItems(r.total)}</p>
      <Results r={r} lang={lang} t={t} />
      {pages > 1 && (
        <nav aria-label={t.pagination} className="flex items-center justify-center gap-4 text-body-md">
          {page > 1 && (
            <Link href={href(page - 1)} className="text-link underline">
              {t.prev}
            </Link>
          )}
          <span className="text-ink-mute">
            {t.pageOf(page, pages)}
          </span>
          {page < pages && (
            <Link href={href(page + 1)} className="text-link underline">
              {t.next}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
