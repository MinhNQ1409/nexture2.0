import Link from 'next/link';
import { Flag, Plus } from 'lucide-react';
import { EVENT_TYPE_LABELS, EVENT_TYPES, formatFuzzyDate, type EventType } from '@nexture/contracts';
import { canOrg, getOrg, listEvents } from '@nexture/core';
import { PublicStateBadge, StatusBadge, VisibilityBadge } from '@/components/badges';
import { PageHeader, Select, linkButton, tableHead, tableRow } from '@/components/ui';
import { requirePageCtx } from '@/lib/session';

export default async function EventsPage({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<Record<string, string>> }) {
  const { orgId } = await params;
  const sp = await searchParams;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const list = await listEvents(ctx, orgId, sp);
  const canCreate = canOrg(org.myRole, 'content.create');
  const filtered = Boolean(sp.q || sp.status || sp.eventType || sp.visibility);

  return (
    // workspace-content
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PageHeader
        title="Sự kiện"
        description="Các cột mốc trên hành trình của doanh nghiệp."
        action={
          canCreate && (
            <Link href={`/o/${orgId}/events/new`} className={linkButton()}>
              <Plus size={20} strokeWidth={1.5} aria-hidden />
              Thêm sự kiện
            </Link>
          )
        }
      />
      <form className="flex flex-wrap gap-2" action="">
        <input name="q" defaultValue={sp.q ?? ''} placeholder="Tìm theo tiêu đề, tóm tắt" className="min-h-11 min-w-0 flex-1 rounded-md border border-hairline bg-canvas-white px-3 text-body-md md:max-w-sm" />
        {org.myRole !== 'VIEWER' && (
          <Select name="status" defaultValue={sp.status ?? ''} className="w-44" aria-label="Trạng thái">
            <option value="">Mọi trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PENDING_REVIEW">Chờ duyệt</option>
            <option value="VERIFIED">Đã xác minh</option>
          </Select>
        )}
        <Select name="eventType" defaultValue={sp.eventType ?? ''} className="w-48" aria-label="Loại sự kiện">
          <option value="">Mọi loại</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <button className={linkButton('secondary')}>Lọc</button>
      </form>

      {list.items.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-lg border border-hairline bg-canvas-white p-12 text-center">
          <Flag size={32} strokeWidth={1.5} className="text-ink-subtle" aria-hidden />
          <p className="text-body-lg text-ink-mute">{filtered ? 'Không có kết quả phù hợp.' : 'Chưa có sự kiện nào ở đây.'}</p>
          {filtered ? (
            <Link href={`/o/${orgId}/events`} className="text-link underline hover:text-link-hover">
              Xóa bộ lọc
            </Link>
          ) : (
            canCreate && (
              <Link href={`/o/${orgId}/events/new`} className={linkButton()}>
                Thêm sự kiện đầu tiên
              </Link>
            )
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas-white shadow-card">
          <table className="w-full min-w-[760px] text-body-md">
            <thead className={tableHead}>
              <tr>
                <th>Sự kiện</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Hiển thị</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((e) => (
                <tr key={e.id} className={`${tableRow} border-l-4 ${e.status === 'DRAFT' ? 'border-l-hairline' : 'border-l-primary'}`}>
                  <td>
                    <Link href={`/o/${orgId}/events/${e.id}`} className="font-semibold hover:text-primary">
                      {e.title}
                    </Link>
                    <p className="text-caption text-ink-mute">{EVENT_TYPE_LABELS[e.subtitle as EventType]}</p>
                  </td>
                  <td className="tabular whitespace-nowrap">
                    {formatFuzzyDate(e.date)}
                    {e.endDate && ` – ${formatFuzzyDate(e.endDate)}`}
                  </td>
                  <td>
                    <StatusBadge status={e.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      <VisibilityBadge visibility={e.visibility} />
                      <PublicStateBadge state={e.publicState} />
                    </div>
                  </td>
                  <td className="tabular whitespace-nowrap text-ink-mute">{e.updatedAt.toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tabular border-t border-hairline px-4 py-3 text-caption text-ink-mute">{list.total.toLocaleString('vi-VN')} sự kiện</p>
        </div>
      )}
    </div>
  );
}
