import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompany } from '@/lib/queries';

// Rendered per request so builds never need the database; data itself is cached by tag in lib/queries.ts.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getCompany((await params).slug);
  return c ? { title: `${c.name} · Văn hóa doanh nghiệp · Culture Atlas`, description: c.shortDesc?.slice(0, 160) } : {};
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = await getCompany((await params).slug);
  if (!c) notFound();
  return (
    <article className="space-y-8">
      <header className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {c.logoUrl && <img src={c.logoUrl} alt={c.name} className="h-20 w-20 rounded-md object-contain" />}
        <div>
          <h1 className="font-display text-4xl font-semibold">{c.name}</h1>
          <p className="text-text-muted">{[c.industryName, c.foundedYear && `Thành lập ${c.foundedYear}`, c.provinceName].filter(Boolean).join(' · ')}</p>
        </div>
      </header>
      {c.shortDesc && <p className="max-w-3xl text-lg">{c.shortDesc}</p>}
      {c.cultureValues.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Giá trị cốt lõi</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {c.cultureValues.map((v) => (
              <li key={v.name} className="rounded-lg border border-border bg-surface p-4">
                <p className="font-semibold">{v.name}</p>
                {v.description && <p className="text-sm text-text-muted">{v.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
