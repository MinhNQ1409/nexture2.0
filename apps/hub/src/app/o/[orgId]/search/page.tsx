// Hub search (06 §13): server-rendered from the query string so results are linkable.
import Link from 'next/link';
import { Search } from 'lucide-react';
import { STATUS_LABELS } from '@nexture/contracts';
import { listPeople, searchOrg } from '@nexture/core';
import { StatusBadge } from '@/components/badges';
import { Card, PageHeader } from '@/components/ui';
import { Highlight } from '@/lib/highlight';
import { requirePageCtx } from '@/lib/session';

const TYPES: [string, string][] = [
  ['STORY', 'Câu chuyện'],
  ['EVENT', 'Sự kiện'],
  ['PERSON', 'Con người'],
  ['PRODUCT_PROJECT', 'Sản phẩm & Dự án'],
  ['MEDIA', 'Tư liệu'],
];
const LABEL = Object.fromEntries(TYPES);
const control = 'min-h-11 rounded-md border border-hairline bg-canvas-white px-3 text-body-md';

export default async function SearchPage({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { orgId } = await params;
  const sp = await searchParams;
  const ctx = await requirePageCtx();
  const q = String(sp.q ?? '').trim();
  const types = ([] as string[]).concat(sp.type ?? []);
  const status = String(sp.status ?? '');
  const personId = String(sp.personId ?? '');
  const [r, people] = await Promise.all([
    searchOrg(ctx, orgId, { q, types: types.join(','), status, personId }),
    listPeople(ctx, orgId, { pageSize: 100, sort: 'name_asc' }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-standard flex-col gap-4">
      <PageHeader title="Tìm kiếm" description="Tìm trong câu chuyện, sự kiện, con người, sản phẩm và tư liệu. Không cần gõ dấu." />
      <form className="flex flex-col gap-3">
        <div className="flex gap-2">
          <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-md border border-hairline-strong bg-canvas-white px-4 focus-within:border-primary">
            <Search size={20} strokeWidth={1.5} className="shrink-0 text-ink-mute" aria-hidden />
            <input name="q" defaultValue={q} maxLength={100} autoFocus placeholder="Nhập từ khóa" aria-label="Từ khóa" className="w-full bg-transparent text-body-lg outline-none" />
          </label>
          <button type="submit" className="rounded-md bg-primary px-5 font-semibold text-on-primary hover:bg-primary-dark">
            Tìm
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {TYPES.map(([t, l]) => (
            <label key={t} className="flex items-center gap-2 text-body-md">
              <input type="checkbox" name="type" value={t} defaultChecked={types.includes(t)} className="accent-primary" />
              {l}
            </label>
          ))}
          <select name="status" defaultValue={status} aria-label="Trạng thái" className={control}>
            <option value="">Mọi trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <select name="personId" defaultValue={personId} aria-label="Người liên quan" className={control}>
            <option value="">Mọi người liên quan</option>
            {people.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </form>

      {!q ? null : q.length < 2 ? (
        <p className="text-body-md text-ink-mute">Nhập ít nhất 2 ký tự.</p>
      ) : r.groups.length === 0 ? (
        <Card className="text-body-md text-ink-mute">Không tìm thấy kết quả cho “{q}”.</Card>
      ) : (
        r.groups.map((g) => (
          <Card key={g.type} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-heading-sm">
                {LABEL[g.type]} <span className="tabular text-body-md font-normal text-ink-mute">({g.total})</span>
              </h2>
              {g.total > g.items.length && (
                <Link href={`/o/${orgId}/${g.collection}?q=${encodeURIComponent(q)}`} className="text-body-md text-link underline">
                  Xem tất cả {g.total}
                </Link>
              )}
            </div>
            <ul className="flex flex-col divide-y divide-hairline">
              {g.items.map((i) => (
                <li key={i.id}>
                  <Link href={`/o/${orgId}/${g.collection}/${i.id}`} className="flex items-center gap-3 py-2 hover:text-primary">
                    {i.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.thumbnailUrl} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                    ) : (
                      <span className="size-10 shrink-0 rounded-md bg-canvas-section" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ink-mute">
                        <Highlight text={i.title} q={q} />
                      </span>
                      {i.subtitle && <span className="block text-caption text-ink-mute">{i.subtitle}</span>}
                    </span>
                    {i.status !== 'VERIFIED' && <StatusBadge status={i.status as 'DRAFT' | 'PENDING_REVIEW'} />}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))
      )}
    </div>
  );
}
