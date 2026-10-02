import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Building2, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
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
  const facts = [
    c.industryName && { icon: Building2, text: c.industryName },
    c.foundedYear && { icon: CalendarDays, text: `Thành lập ${c.foundedYear}` },
    c.provinceName && { icon: MapPin, text: c.provinceName },
  ].filter(Boolean) as { icon: typeof Building2; text: string }[];

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 rounded-xl border border-hairline bg-canvas-white p-6 shadow-card md:flex-row md:items-center md:p-8">
        {c.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.logoUrl} alt={c.name} className="size-24 shrink-0 rounded-lg object-contain" />
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

      {c.cultureValues.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-heading-lg">Giá trị cốt lõi</h2>
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
    </article>
  );
}
