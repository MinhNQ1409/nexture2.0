// Explore companies (07 §2): filters live in the query string, a plain GET form, no client JS.
import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';
import { COMPANY_PAGE, findCompanies, getFacets, type CompanyQuery } from '@/lib/queries';
import { CompanyCard } from '../company-card';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Khám phá doanh nghiệp · Culture Atlas', description: 'Danh sách doanh nghiệp Việt Nam và văn hóa của họ.' };

type SP = Record<string, string | string[] | undefined>;
const list = (v: string | string[] | undefined) => ([] as string[]).concat(v ?? []).filter(Boolean);
const year = (v: string | string[] | undefined) => {
  const n = Number(list(v)[0]);
  return n >= 1800 && n <= 2100 ? n : undefined;
};
const SORTS = [
  ['new', 'Mới tham gia'],
  ['name', 'Tên A–Z'],
  ['founded', 'Năm thành lập'],
] as const;
const control = 'min-h-11 rounded-md border border-hairline-strong bg-canvas-white px-3 text-body-md';

function Multi({ name, label, options, selected }: { name: string; label: string; options: { code: string; name: string; n: number }[]; selected: string[] }) {
  return (
    <details className="group relative">
      <summary className={`${control} flex cursor-pointer list-none items-center gap-2`}>
        {label}
        {selected.length > 0 && <span className="rounded-full bg-primary px-2 text-caption text-on-primary">{selected.length}</span>}
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 top-full z-[5] mt-1 flex max-h-72 w-64 flex-col overflow-y-auto rounded-md border border-hairline bg-canvas-white p-2 shadow-card">
        {options.length === 0 && <span className="p-2 text-caption text-ink-mute">Chưa có dữ liệu</span>}
        {options.map((o) => (
          <label key={o.code} className="flex items-center gap-2 rounded-sm p-2 text-body-md hover:bg-canvas-section">
            <input type="checkbox" name={name} value={o.code} defaultChecked={selected.includes(o.code)} className="accent-primary" />
            <span className="flex-1">{o.name}</span>
            <span className="tabular text-caption text-ink-mute">{o.n}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

export default async function Companies({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const sort = (SORTS.find(([k]) => k === list(sp.sort)[0])?.[0] ?? 'new') as CompanyQuery['sort'];
  const f: CompanyQuery = {
    industry: list(sp.industry),
    province: list(sp.province),
    from: year(sp.from),
    to: year(sp.to),
    q: list(sp.q)[0]?.trim().slice(0, 100),
    sort,
    page: Math.max(1, Number(list(sp.page)[0]) || 1),
  };
  const [{ total, items }, facets] = await Promise.all([findCompanies(f), getFacets()]);
  const filtered = Boolean(f.industry.length || f.province.length || f.from || f.to || f.q);
  const pages = Math.max(1, Math.ceil(total / COMPANY_PAGE));
  const pageHref = (p: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (k !== 'page') for (const x of list(v)) u.append(k, x);
    u.set('page', String(p));
    return `/companies?${u}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-display-md">Khám phá doanh nghiệp</h1>
        <p className="text-body-lg text-ink-mute">Lọc theo ngành, tỉnh thành và năm thành lập.</p>
      </div>
      <form className="flex flex-wrap items-center gap-2" role="search">
        <label className={`${control} flex min-w-0 flex-1 basis-56 items-center gap-2`}>
          <Search size={16} strokeWidth={1.5} className="shrink-0 text-ink-mute" aria-hidden />
          <input name="q" defaultValue={f.q} maxLength={100} placeholder="Tên doanh nghiệp" aria-label="Tìm theo tên" className="w-full bg-transparent outline-none" />
        </label>
        <Multi name="industry" label="Ngành" options={facets.industries} selected={f.industry} />
        <Multi name="province" label="Tỉnh/Thành" options={facets.provinces} selected={f.province} />
        <input name="from" type="number" min={1800} max={2100} defaultValue={f.from} placeholder="Từ năm" aria-label="Thành lập từ năm" className={`${control} w-28`} />
        <input name="to" type="number" min={1800} max={2100} defaultValue={f.to} placeholder="Đến năm" aria-label="Thành lập đến năm" className={`${control} w-28`} />
        <select name="sort" defaultValue={sort} aria-label="Sắp xếp" className={control}>
          {SORTS.map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <button type="submit" className="min-h-11 rounded-md bg-primary px-5 font-semibold text-on-primary hover:bg-primary-dark">
          Lọc
        </button>
        {filtered && (
          <Link href="/companies" className="px-2 text-body-md text-link underline">
            Xóa bộ lọc
          </Link>
        )}
      </form>
      <p className="tabular text-body-md text-ink-mute">{total.toLocaleString('vi-VN')} doanh nghiệp</p>
      {items.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
          <p className="text-body-lg text-ink-mute">Chưa có doanh nghiệp phù hợp.</p>
          {filtered && (
            <Link href="/companies" className="text-body-md text-link underline">
              Xóa bộ lọc
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CompanyCard key={c.slug} c={c} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center justify-center gap-4 text-body-md">
          {f.page > 1 && (
            <Link href={pageHref(f.page - 1)} className="text-link underline">
              Trang trước
            </Link>
          )}
          <span className="text-ink-mute">
            Trang {f.page}/{pages}
          </span>
          {f.page < pages && (
            <Link href={pageHref(f.page + 1)} className="text-link underline">
              Trang sau
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
