import { getCompanies } from '@/lib/queries';
import { CompanyCard } from '../company-card';

// Rendered per request so builds never need the database; data itself is cached by tag in lib/queries.ts.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Khám phá doanh nghiệp · Culture Atlas', description: 'Danh sách doanh nghiệp Việt Nam và văn hóa của họ.' };

export default async function Companies() {
  const companies = await getCompanies();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display-md">Khám phá doanh nghiệp</h1>
      {companies.length === 0 ? (
        <p className="flex min-h-80 items-center justify-center text-body-lg text-ink-mute">Chưa có doanh nghiệp nào ở đây.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <CompanyCard key={c.slug} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
