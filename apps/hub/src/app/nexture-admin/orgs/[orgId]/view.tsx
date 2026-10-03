'use client';
// 06 §15.2: company header with hide / lock / delete, and its public content with per-item hide.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, EyeOff, ExternalLink, Lock, LockOpen, Trash2 } from 'lucide-react';
import { PUBLIC_STATE_LABELS } from '@nexture/contracts';
import { Alert, Badge, Button, Card, Dialog, Field, Input, Textarea, tableHead, tableRow } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';

type Item = { type: string; id: string; title: string; state: keyof typeof PUBLIC_STATE_LABELS; hiddenReason: string | null; hiddenAt: string | null; atlasUrl: string | null };
type Org = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  createdBy: string | null;
  memberCount: number;
  atlas: 'ON' | 'OFF' | 'HIDDEN';
  atlasUrl: string | null;
  hiddenReason: string | null;
  hiddenAt: string | null;
  hiddenBy: string | null;
  lockedAt: string | null;
  lockedReason: string | null;
  lockedBy: string | null;
  protectedBy: string[];
  items: Item[];
};

const TYPE_LABEL: Record<string, string> = { STORY: 'Câu chuyện', EVENT: 'Sự kiện', PERSON: 'Con người', PRODUCT_PROJECT: 'Sản phẩm/Dự án' };
const ATLAS_BADGE = { ON: ['success', 'Atlas: đang bật'], OFF: ['neutral', 'Atlas: tắt'], HIDDEN: ['error', 'Atlas: bị NexTure ẩn'] } as const;
const STATE_TONE: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = { LIVE: 'success', WAITING_ORG: 'warning', HIDDEN_BY_NEXTURE: 'error' };
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');

type Ask = { kind: 'hide'; targetType: string; targetId: string; label: string } | { kind: 'lock' } | { kind: 'delete' };

export function AdminOrgView({ initial }: { initial: Org }) {
  const router = useRouter();
  const [org, setOrg] = useState(initial);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>, msg: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setOrg(await api<Org>(`/admin/organizations/${org.id}`));
      setNotice(msg);
      setAsk(null);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }
  const unhide = (targetType: string, targetId: string) => run(() => api('/admin/unhide', { method: 'POST', json: { targetType, targetId } }), 'Đã bỏ ẩn.');
  const [tone, label] = ATLAS_BADGE[org.atlas];

  return (
    <div className="flex flex-col gap-4">
      <Link href="/nexture-admin" className="inline-flex w-fit items-center gap-2 text-body-md text-ink-mute hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
        Tất cả doanh nghiệp
      </Link>
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-display-md">{org.name}</h1>
            <p className="mt-1 text-body-md text-ink-mute">
              {org.slug} · tạo ngày {day(org.createdAt)}
              {org.createdBy ? ` bởi ${org.createdBy}` : ''} · {org.memberCount} thành viên
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={tone}>{label}</Badge>
              {org.lockedAt && <Badge tone="error">Đã khóa</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {org.atlasUrl && (
              <a href={org.atlasUrl} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-button-md text-primary hover:bg-primary-light">
                Xem trên Atlas
                <ExternalLink size={16} strokeWidth={1.5} aria-hidden />
              </a>
            )}
            {org.atlas === 'HIDDEN' ? (
              <Button variant="secondary" disabled={busy} onClick={() => unhide('ORGANIZATION', org.id)}>
                Bỏ ẩn hồ sơ
              </Button>
            ) : (
              <Button variant="secondary" disabled={busy} onClick={() => setAsk({ kind: 'hide', targetType: 'ORGANIZATION', targetId: org.id, label: `hồ sơ ${org.name}` })}>
                <EyeOff size={16} strokeWidth={1.5} aria-hidden />
                Ẩn hồ sơ khỏi Atlas
              </Button>
            )}
            {org.lockedAt ? (
              <Button variant="secondary" disabled={busy} onClick={() => run(() => api(`/admin/organizations/${org.id}/lock`, { method: 'DELETE' }), 'Đã mở khóa. Hồ sơ vẫn ẩn trên Atlas cho tới khi bạn bấm "Bỏ ẩn hồ sơ".')}>
                <LockOpen size={16} strokeWidth={1.5} aria-hidden />
                Mở khóa
              </Button>
            ) : (
              <Button variant="secondary" disabled={busy} onClick={() => setAsk({ kind: 'lock' })}>
                <Lock size={16} strokeWidth={1.5} aria-hidden />
                Khóa doanh nghiệp
              </Button>
            )}
            <Button variant="danger" disabled={busy || org.protectedBy.length > 0} onClick={() => setAsk({ kind: 'delete' })}>
              <Trash2 size={16} strokeWidth={1.5} aria-hidden />
              Xóa doanh nghiệp
            </Button>
          </div>
        </div>
        {org.protectedBy.length > 0 && (
          <p className="text-body-md text-ink-mute">
            Không thể xóa: doanh nghiệp có thành viên là tài khoản Quản trị NexTure ({org.protectedBy.join(', ')}).
          </p>
        )}
        {org.hiddenAt && (
          <p className="text-body-md text-error">
            Hồ sơ bị ẩn ngày {day(org.hiddenAt)}
            {org.hiddenBy ? ` bởi ${org.hiddenBy}` : ''}: {org.hiddenReason}
          </p>
        )}
        {org.lockedAt && (
          <p className="text-body-md text-error">
            Khóa ngày {day(org.lockedAt)}
            {org.lockedBy ? ` bởi ${org.lockedBy}` : ''}: {org.lockedReason}. Thành viên không vào được doanh nghiệp này trong Hub.
          </p>
        )}
      </Card>
      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <Card className="flex flex-col gap-3 overflow-x-auto">
        <div>
          <h2 className="text-heading-md">Nội dung công khai</h2>
          <p className="text-body-md text-ink-mute">Nội dung doanh nghiệp đã bật công khai. NexTure chỉ thấy tiêu đề, không đọc dữ liệu nội bộ.</p>
        </div>
        <table className="w-full min-w-[680px]">
          <thead className={tableHead}>
            <tr>
              <th>Loại</th>
              <th>Tiêu đề</th>
              <th>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {org.items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-body-md text-ink-mute">
                  Doanh nghiệp chưa công khai nội dung nào.
                </td>
              </tr>
            )}
            {org.items.map((i) => (
              <tr key={i.id} className={tableRow}>
                <td className="text-body-md text-ink-mute">{TYPE_LABEL[i.type]}</td>
                <td className="font-semibold">
                  {i.atlasUrl ? (
                    <a href={i.atlasUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-primary">
                      {i.title}
                      <ExternalLink size={14} strokeWidth={1.5} aria-hidden />
                    </a>
                  ) : (
                    i.title
                  )}
                </td>
                <td>
                  <Badge tone={STATE_TONE[i.state] ?? 'neutral'}>{PUBLIC_STATE_LABELS[i.state]}</Badge>
                  {i.hiddenReason && (
                    <span className="mt-1 block text-caption text-error">
                      {i.hiddenReason} · {day(i.hiddenAt)}
                    </span>
                  )}
                </td>
                <td className="text-right">
                  {i.hiddenReason ? (
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => unhide(i.type, i.id)}>
                      Bỏ ẩn
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => setAsk({ kind: 'hide', targetType: i.type, targetId: i.id, label: `"${i.title}"` })}>
                      Ẩn
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {ask?.kind === 'hide' && (
        <ReasonDialog
          title={`Ẩn ${ask.label}`}
          note="Nội dung rời Atlas ngay. Doanh nghiệp sẽ thấy lý do này trong Hub và không tự bật lại được."
          action="Ẩn"
          busy={busy}
          error={error}
          onClose={() => setAsk(null)}
          onSubmit={(reason) => run(() => api('/admin/hide', { method: 'POST', json: { targetType: ask.targetType, targetId: ask.targetId, reason } }), 'Đã ẩn khỏi Atlas.')}
        />
      )}
      {ask?.kind === 'lock' && (
        <ReasonDialog
          title={`Khóa ${org.name}`}
          note="Mọi thành viên sẽ không vào được doanh nghiệp này trong Hub, và hồ sơ bị ẩn khỏi Atlas. Dữ liệu được giữ nguyên, có thể mở khóa lại."
          action="Khóa"
          busy={busy}
          error={error}
          onClose={() => setAsk(null)}
          onSubmit={(reason) => run(() => api(`/admin/organizations/${org.id}/lock`, { method: 'POST', json: { reason } }), 'Đã khóa doanh nghiệp.')}
        />
      )}
      {ask?.kind === 'delete' && (
        <DeleteDialog
          org={org}
          busy={busy}
          error={error}
          onClose={() => setAsk(null)}
          onConfirm={async (confirmSlug) => {
            setBusy(true);
            setError(null);
            try {
              await api(`/admin/organizations/${org.id}`, { method: 'DELETE', json: { confirmSlug } });
              router.replace('/nexture-admin');
              router.refresh();
            } catch (e) {
              setError((e as ApiError).message);
              setBusy(false);
            }
          }}
        />
      )}
    </div>
  );
}

function ReasonDialog({ title, note, action, busy, error, onClose, onSubmit }: { title: string; note: string; action: string; busy: boolean; error: string | null; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  const ok = reason.trim().length >= 5;
  return (
    <Dialog title={title} onClose={onClose}>
      <p className="text-body-md text-ink-mute">{note}</p>
      <Field label="Lý do" hint="Từ 5 đến 500 ký tự" error={error}>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3} autoFocus />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="danger" disabled={!ok || busy} onClick={() => onSubmit(reason.trim())}>
          {action}
        </Button>
      </div>
    </Dialog>
  );
}

function DeleteDialog({ org, busy, error, onClose, onConfirm }: { org: Org; busy: boolean; error: string | null; onClose: () => void; onConfirm: (slug: string) => void }) {
  const [slug, setSlug] = useState('');
  return (
    <Dialog title={`Xóa vĩnh viễn ${org.name}`} onClose={onClose}>
      <Alert>
        Toàn bộ câu chuyện, sự kiện, con người, sản phẩm, tư liệu, thành viên và nhật ký của doanh nghiệp sẽ bị xóa vĩnh viễn. Các trang trên Atlas sẽ báo &quot;đã gỡ&quot;. Không thể hoàn tác.
      </Alert>
      <Field label={`Nhập "${org.slug}" để xác nhận`} error={error}>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} autoFocus autoComplete="off" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="danger" disabled={slug.trim() !== org.slug || busy} onClick={() => onConfirm(slug.trim())}>
          Xóa vĩnh viễn
        </Button>
      </div>
    </Dialog>
  );
}
