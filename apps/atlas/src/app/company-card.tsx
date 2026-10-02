import Link from 'next/link';

type Company = { slug: string; name: string; logoUrl: string | null; industryName: string | null; foundedYear: number | null; provinceName: string | null; shortDesc: string | null };

export function CompanyCard({ c }: { c: Company }) {
  return (
    <Link href={`/companies/${c.slug}`} className="block rounded-lg border border-border bg-surface p-5 shadow-sm hover:shadow-md">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {c.logoUrl ? <img src={c.logoUrl} alt="" className="h-12 w-12 rounded-sm object-contain" /> : <div className="h-12 w-12 rounded-sm bg-surface-muted" />}
        <div>
          <p className="font-display font-semibold">{c.name}</p>
          <p className="text-xs text-text-muted">{[c.industryName, c.foundedYear, c.provinceName].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {c.shortDesc && <p className="mt-3 line-clamp-3 text-sm text-text-muted">{c.shortDesc}</p>}
    </Link>
  );
}
