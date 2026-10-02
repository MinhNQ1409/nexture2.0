import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCompanies } from '@/lib/queries';
import { CompanyCard } from './company-card';
import { SearchBox } from './search-box';

// Rendered per request so builds never need the database; data itself is cached by tag in lib/queries.ts.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const companies = await getCompanies();
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="max-w-[900px] text-display-lg md:text-display-xl">Vietnam Enterprise Culture Atlas</h1>
        <p className="max-w-reading text-body-lg text-ink-mute">Khám phá những câu chuyện, con người, sản phẩm và dấu mốc tạo nên các doanh nghiệp Việt Nam.</p>
        <SearchBox large />
        <p className="tabular text-caption text-ink-mute">{companies.length.toLocaleString('vi-VN')} doanh nghiệp</p>
      </section>
      {companies.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-heading-lg">Mới tham gia Atlas</h2>
            <Link href="/companies" className="inline-flex items-center gap-2 text-body-md font-semibold text-primary hover:text-primary-dark">
              Xem tất cả
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.slice(0, 6).map((c) => (
              <CompanyCard key={c.slug} c={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
