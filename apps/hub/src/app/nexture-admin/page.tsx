// 06 §15.1: every company, searchable by name or slug.
import Link from 'next/link';
import { ExternalLink, Search } from 'lucide-react';
import { ACTIVITY_LABELS } from '@nexture/contracts';
import { adminListOrgs, adminRecentActions } from '@nexture/core';
import { Badge, Card, PageHeader, tableHead, tableRow } from '@/components/ui';
import { relativeTime } from '@/lib/activity';
import { requirePageCtx } from '@/lib/session';
import Form from 'next/form';
import { DemoButton } from '@/components/demo-button';

const ATLAS_BADGE = { ON: ['success', 'Đang bật'], OFF: ['neutral', 'Tắt'], HIDDEN: ['error', 'Bị ẩn'] } as const;

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const ctx = await requirePageCtx('/nexture-admin');
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const [r, recent] = await Promise.all([adminListOrgs(ctx, { q, page }), adminRecentActions(ctx)]);
  const pages = Math.max(1, Math.ceil(r.total / r.pageSize));
  const href = (p: number) => `/nexture-admin?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Doanh nghiệp" description={`${r.total} doanh nghiệp trên NexTure. Mở một doanh nghiệp để ẩn nội dung, khóa hoặc xóa.`} action={<DemoButton set="corps" />} />
      <Form action="/nexture-admin" className="flex max-w-xl gap-2">
        <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-hairline-strong bg-canvas-white px-3 focus-within:border-primary">
          <Search size={18} strokeWidth={1.5} className="shrink-0 text-ink-mute" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Tìm theo tên hoặc đường dẫn" aria-label="Tìm doanh nghiệp" className="w-full bg-transparent text-body-md outline-none" />
        </label>
        <button type="submit" className="rounded-md bg-primary px-5 font-semibold text-on-primary hover:bg-primary-dark">
          Tìm
        </button>
      </Form>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px]">
          <thead className={tableHead}>
            <tr>
              <th>Tên</th>
              <th>Đường dẫn</th>
              <th>Ngày tạo</th>
              <th className="text-right">Thành viên</th>
              <th>Atlas</th>
              <th className="text-right">Nội dung trên Atlas</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {r.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-body-md text-ink-mute">
                  Không có doanh nghiệp phù hợp.
                </td>
              </tr>
            )}
            {r.items.map((o) => {
              const [tone, label] = ATLAS_BADGE[o.atlas];
              return (
                <tr key={o.id} className={tableRow}>
                  <td>
                    <Link href={`/nexture-admin/orgs/${o.id}`} className="font-semibold text-ink hover:text-primary">
                      {o.name}
                    </Link>
                    {o.lockedAt && (
                      <span className="ml-2">
                        <Badge tone="error">Đã khóa</Badge>
                      </span>
                    )}
                  </td>
                  <td className="text-body-md text-ink-mute">{o.slug}</td>
                  <td className="text-body-md">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="text-right">{o.memberCount}</td>
                  <td>
                    <Badge tone={tone}>{label}</Badge>
                  </td>
                  <td className="text-right">{o.liveCount}</td>
                  <td>
                    {o.atlasUrl && (
                      <a href={o.atlasUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-body-md text-link hover:underline">
                        Xem trên Atlas
                        <ExternalLink size={14} strokeWidth={1.5} aria-hidden />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      {pages > 1 && (
        <nav className="flex items-center gap-3 text-body-md" aria-label="Phân trang">
          {page > 1 && <Link href={href(page - 1)} className="text-link hover:underline">Trang trước</Link>}
          <span className="text-ink-mute">
            Trang {page}/{pages}
          </span>
          {page < pages && <Link href={href(page + 1)} className="text-link hover:underline">Trang sau</Link>}
        </nav>
      )}
      {recent.length > 0 && (
        <Card className="flex flex-col gap-2">
          <h2 className="text-heading-sm">Thao tác gần đây của NexTure</h2>
          <ul className="flex flex-col gap-1 text-body-md">
            {recent.map((a) => (
              <li key={a.id}>
                <span className="font-semibold">{a.actor ?? 'NexTure'}</span> {(ACTIVITY_LABELS[a.action] ?? a.action).replace(/^NexTure /, '')} {a.targetLabel}
                <span className="text-ink-mute"> · {relativeTime(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
