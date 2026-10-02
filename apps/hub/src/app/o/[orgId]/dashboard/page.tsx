import { ROLE_LABELS } from '@nexture/contracts';
import { getOrg } from '@nexture/core';
import { Alert, Card } from '@/components/ui';
import { requirePageCtx } from '@/lib/session';

const CHECKLIST = [
  ['hasFounder', 'Người sáng lập và câu chuyện hình thành'],
  ['hasEvents', 'Ít nhất 3 cột mốc trên Culture Timeline'],
  ['hasPeople', 'Con người tiêu biểu'],
  ['hasCultureStory', 'Câu chuyện văn hóa'],
  ['hasProduct', 'Sản phẩm hoặc dự án'],
] as const;

export default async function Dashboard({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<{ created?: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const created = (await searchParams).created === '1';
  return (
    <div className="max-w-3xl space-y-6">
      {created && <Alert tone="success">Đã tạo Culture Hub cho {org.name}.</Alert>}
      <h1 className="font-display text-3xl font-semibold">Tổng quan</h1>
      <p className="text-text-muted">Vai trò của bạn: {ROLE_LABELS[org.myRole]}</p>
      <Card>
        <h2 className="font-display text-lg font-semibold">Bắt đầu xây dựng Culture Hub</h2>
        <ul className="mt-4 space-y-2">
          {!org.logoMediaId && <li className="text-text-muted">○ Thêm logo doanh nghiệp</li>}
          {CHECKLIST.map(([k, label]) => (
            <li key={k} className={org.onboarding[k] ? 'text-success' : 'text-text-muted'}>
              {org.onboarding[k] ? '✓' : '○'} {label}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
