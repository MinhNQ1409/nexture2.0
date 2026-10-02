// Activity log (06 §14.3), ADMIN only. Paged by query string; "changes" open with <details>, no client JS.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ACTIVITY_LABELS, TARGET_TYPE_LABELS } from '@nexture/contracts';
import { canOrg, getOrg, listActivity } from '@nexture/core';
import { Card, PageHeader, tableHead, tableRow } from '@/components/ui';
import { activityHref, showValue } from '@/lib/activity';
import { requirePageCtx } from '@/lib/session';

export default async function ActivityPage({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<{ page?: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  if (!canOrg(org.myRole, 'activity.view')) notFound();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const r = await listActivity(ctx, orgId, { page, pageSize: 30 });
  const pages = Math.max(1, Math.ceil(r.total / r.pageSize));

  return (
    <div className="mx-auto flex w-full max-w-standard flex-col gap-4">
      <PageHeader title="Nhật ký hoạt động" description="Mọi thay đổi trong Hub của doanh nghiệp, mới nhất trước." />
      {r.items.length === 0 ? (
        <Card className="text-body-md text-ink-mute">Chưa có hoạt động nào.</Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full min-w-[720px]">
            <thead className={tableHead}>
              <tr>
                <th>Thời gian</th>
                <th>Người</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
              </tr>
            </thead>
            <tbody>
              {r.items.map((a) => {
                const href = activityHref(orgId, a.targetType, a.targetId, a.action);
                const changes = a.changes ? Object.entries(a.changes) : [];
                return (
                  <tr key={a.id} className={`${tableRow} align-top`}>
                    <td className="tabular whitespace-nowrap text-ink-mute">{new Date(a.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{a.actor?.name ?? 'Hệ thống'}</td>
                    <td>
                      {ACTIVITY_LABELS[a.action] ?? a.action}
                      {changes.length > 0 && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-caption text-link">Xem thay đổi</summary>
                          <table className="mt-2 text-caption">
                            <thead>
                              <tr className="text-left text-ink-mute">
                                <th className="pr-3 font-semibold">Trường</th>
                                <th className="pr-3 font-semibold">Trước</th>
                                <th className="font-semibold">Sau</th>
                              </tr>
                            </thead>
                            <tbody>
                              {changes.map(([k, [before, after]]) => (
                                <tr key={k}>
                                  <td className="pr-3 font-mono">{k}</td>
                                  <td className="max-w-48 truncate pr-3">{showValue(before)}</td>
                                  <td className="max-w-48 truncate">{showValue(after)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </details>
                      )}
                    </td>
                    <td>
                      <span className="text-caption text-ink-mute">{TARGET_TYPE_LABELS[a.targetType] ?? a.targetType} </span>
                      {href ? (
                        <Link href={href} className="text-link underline hover:text-link-hover">
                          {a.targetLabel ?? 'Mở'}
                        </Link>
                      ) : (
                        a.targetLabel
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center justify-center gap-4 text-body-md">
          {page > 1 && (
            <Link href={`?page=${page - 1}`} className="text-link underline">
              Trang trước
            </Link>
          )}
          <span className="text-ink-mute">
            Trang {page}/{pages}
          </span>
          {page < pages && (
            <Link href={`?page=${page + 1}`} className="text-link underline">
              Trang sau
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
