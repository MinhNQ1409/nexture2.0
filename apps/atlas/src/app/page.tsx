import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getHome, type EntityCard } from '@/lib/queries';
import { CompanyCard } from './company-card';
import { RelatedCard } from './entity-view';
import { SearchBox } from './search-box';

// Rendered per request so builds never need the database; data itself is cached by tag in lib/queries.ts.
export const dynamic = 'force-dynamic';

function Block({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading-lg">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-2 text-body-md font-semibold text-primary hover:text-primary-dark">
          Xem tất cả
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Entities({ items }: { items: EntityCard[] }) {
  return items.map((e) => (
    <div key={e.id} className="flex flex-col gap-1">
      <RelatedCard e={e} />
      {e.companyName && <span className="px-1 text-caption text-ink-mute">{e.companyName}</span>}
    </div>
  ));
}

export default async function Home() {
  const h = await getHome();
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="max-w-[900px] text-display-lg md:text-display-xl">Vietnam Enterprise Culture Atlas</h1>
        <p className="max-w-reading text-body-lg text-ink-mute">Khám phá những câu chuyện, con người, sản phẩm và dấu mốc tạo nên các doanh nghiệp Việt Nam.</p>
        <SearchBox large />
        <p className="tabular text-caption text-ink-mute">
          {h.totals.companies.toLocaleString('vi-VN')} doanh nghiệp · {h.totals.stories.toLocaleString('vi-VN')} câu chuyện
        </p>
      </section>
      {h.featured.length > 0 && (
        <Block title="Doanh nghiệp nổi bật" href="/companies">
          {h.featured.map((c) => (
            <CompanyCard key={c.slug} c={c} />
          ))}
        </Block>
      )}
      {h.stories.length > 0 && (
        <Block title="Câu chuyện nổi bật" href="/search?type=story">
          <Entities items={h.stories} />
        </Block>
      )}
      {h.people.length > 0 && (
        <Block title="Người sáng lập & nhân vật" href="/search?type=person">
          <Entities items={h.people} />
        </Block>
      )}
      {h.products.length > 0 && (
        <Block title="Sản phẩm & dự án" href="/search?type=product">
          <Entities items={h.products} />
        </Block>
      )}
      {h.newest.length > 0 && (
        <Block title="Mới tham gia Atlas" href="/companies">
          {h.newest.map((c) => (
            <CompanyCard key={c.slug} c={c} />
          ))}
        </Block>
      )}
    </div>
  );
}
