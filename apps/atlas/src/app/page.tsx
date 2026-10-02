import { getCompanies } from '@/lib/queries';
import { CompanyCard } from './company-card';

// Rendered per request so builds never need the database; data itself is cached by tag in lib/queries.ts.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const companies = await getCompanies();
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="font-display text-4xl font-semibold">Vietnam Enterprise Culture Atlas</h1>
        <p className="text-text-muted">Khám phá những câu chuyện, con người, sản phẩm và dấu mốc tạo nên các doanh nghiệp Việt Nam.</p>
        <p className="text-sm text-text-muted">{companies.length} doanh nghiệp</p>
      </section>
      {companies.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Mới tham gia Atlas</h2>
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
