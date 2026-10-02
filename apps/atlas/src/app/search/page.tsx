// Search (07 §8): grouped results without a type, paged list with one. Rendered per request, never indexed.
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SEARCH_TYPES, searchCompanies, searchEntities, type SearchType } from '@/lib/search';
import { RelatedCard } from '../entity-view';
import { CompanyCard } from '../company-card';
import { SearchBox } from '../search-box';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Tìm kiếm · Culture Atlas', robots: { index: false, follow: true } };

const GROUPS: [SearchType, string][] = [
  ['company', 'Doanh nghiệp'],
  ['story', 'Câu chuyện'],
  ['event', 'Sự kiện'],
  ['person', 'Con người'],
  ['product', 'Sản phẩm & Dự án'],
];
const PAGE = 24;

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().slice(0, 100);
  const type = sp.type && sp.type in SEARCH_TYPES ? (sp.type as SearchType) : null;
  const page = Math.max(1, Number(sp.page) || 1);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-display-md">Tìm kiếm</h1>
        <SearchBox q={q} type={type} />
        {type && (
          <Link href={`/search?q=${encodeURIComponent(q)}`} className="w-fit text-body-md text-link underline">
            Tìm trong mọi loại
          </Link>
        )}
      </div>
      {type && !q ? (
        <TypeResults q="" type={type} page={page} />
      ) : !q ? (
        <p className="text-body-md text-ink-mute">Thử tìm theo tên doanh nghiệp, người sáng lập, sản phẩm…</p>
      ) : q.length < 2 ? (
        <p className="text-body-md text-ink-mute">Nhập ít nhất 2 ký tự.</p>
      ) : type ? (
        <TypeResults q={q} type={type} page={page} />
      ) : (
        <Grouped q={q} />
      )}
    </div>
  );
}

async function run(q: string, type: SearchType, limit: number, offset = 0) {
  const types = SEARCH_TYPES[type];
  if (!types) {
    const r = await searchCompanies(q, limit, offset);
    return { total: r.total, companies: r.items, entities: [] };
  }
  const r = await searchEntities(q, types, limit, offset);
  return { total: r.total, companies: [], entities: r.items };
}

function Results({ r }: { r: Awaited<ReturnType<typeof run>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {r.companies.map((c) => (
        <CompanyCard key={c.slug} c={c} />
      ))}
      {r.entities.map((e) => (
        <div key={e.id} className="flex flex-col gap-1">
          <RelatedCard e={e} />
          <span className="px-1 text-caption text-ink-mute">{e.companyName}</span>
        </div>
      ))}
    </div>
  );
}

async function Grouped({ q }: { q: string }) {
  const all = await Promise.all(GROUPS.map(async ([t, label]) => ({ t, label, r: await run(q, t, 6) })));
  const found = all.filter((g) => g.r.total > 0);
  if (!found.length) return <p className="text-body-md text-ink-mute">Không tìm thấy kết quả cho “{q}”.</p>;
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
                Xem tất cả
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
              </Link>
            )}
          </div>
          <Results r={r} />
        </section>
      ))}
    </>
  );
}

async function TypeResults({ q, type, page }: { q: string; type: SearchType; page: number }) {
  const r = await run(q, type, PAGE, (page - 1) * PAGE);
  if (!r.total) return <p className="text-body-md text-ink-mute">{q ? `Không tìm thấy kết quả cho “${q}”.` : 'Chưa có nội dung nào.'}</p>;
  const pages = Math.ceil(r.total / PAGE);
  const href = (p: number) => `/search?q=${encodeURIComponent(q)}&type=${type}&page=${p}`;
  return (
    <section className="flex flex-col gap-4">
      <p className="tabular text-body-md text-ink-mute">{q ? `${r.total} kết quả` : `${r.total} mục, mới nhất trước`}</p>
      <Results r={r} />
      {pages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center justify-center gap-4 text-body-md">
          {page > 1 && (
            <Link href={href(page - 1)} className="text-link underline">
              Trang trước
            </Link>
          )}
          <span className="text-ink-mute">
            Trang {page}/{pages}
          </span>
          {page < pages && (
            <Link href={href(page + 1)} className="text-link underline">
              Trang sau
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
