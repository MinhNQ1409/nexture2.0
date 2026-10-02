import Link from 'next/link';
import { Building2 } from 'lucide-react';
import type { Dict } from '@/lib/i18n';

type Company = { slug: string; name: string; logoUrl: string | null; industryName: string | null; foundedYear: number | null; provinceName: string | null; shortDesc: string | null };

export function CompanyCard({ c, t }: { c: Company; t: Dict }) {
  return (
    <Link
      href={`/companies/${c.slug}`}
      className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-white p-5 shadow-card transition-colors duration-[120ms] hover:bg-canvas-section"
    >
      <div className="flex min-w-0 items-center gap-3">
        {c.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" decoding="async" src={c.logoUrl} alt="" className="size-12 shrink-0 rounded-md bg-canvas-white object-contain" />
        ) : (
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary">
            <Building2 size={24} strokeWidth={1.5} aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-heading-sm">{c.name}</p>
          <p className="truncate text-caption text-ink-mute">{[c.industryName, c.foundedYear && t.since(c.foundedYear), c.provinceName].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {c.shortDesc && <p className="line-clamp-3 text-body-md text-ink-mute">{c.shortDesc}</p>}
    </Link>
  );
}
