'use client';
// Review queue (06 §11): everything PENDING_REVIEW, oldest first. Admin approves or returns; editors only see it.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Alert, Button, Card, PageHeader, tableHead, tableRow } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';

type Item = { type: string; collection: string; id: string; title: string; version: number; submittedBy: { name: string } | null; submittedAt: string; thumbnailUrl: string | null };

const TYPE_LABELS: Record<string, string> = { STORY: 'Câu chuyện', EVENT: 'Sự kiện', PERSON: 'Con người', PRODUCT_PROJECT: 'Sản phẩm & Dự án', MEDIA: 'Tư liệu' };
const href = (orgId: string, i: Item) => `/o/${orgId}/${i.collection === 'media' ? 'library' : i.collection}/${i.id}`;
const when = (iso: string) => new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export function ReviewView({ orgId, isAdmin, initial }: { orgId: string; isAdmin: boolean; initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const call = (i: Item, action: 'approve' | 'return', note?: string) => api(`/orgs/${orgId}/${i.collection}/${i.id}/${action}`, { method: 'POST', json: { version: i.version, ...(note ? { note } : {}) } });
  const drop = (ids: string[]) => {
    setItems((xs) => xs.filter((x) => !ids.includes(x.id)));
    setSelected((s) => new Set([...s].filter((x) => !ids.includes(x))));
  };

  async function one(i: Item, action: 'approve' | 'return') {
    let note: string | undefined;
    if (action === 'return') {
      note = prompt(`Lý do trả lại "${i.title}" (bắt buộc):`)?.trim();
      if (!note) return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await call(i, action, note);
      drop([i.id]);
      setNotice(action === 'approve' ? `Đã xác minh "${i.title}".` : `Đã trả lại "${i.title}".`);
      router.refresh();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  async function approveSelected() {
    const list = items.filter((i) => selected.has(i.id));
    setBusy(true);
    setError(null);
    setNotice(null);
    const done: string[] = [];
    const failed: string[] = [];
    for (const i of list) {
      try {
        await call(i, 'approve');
        done.push(i.id);
      } catch (e) {
        failed.push(`${i.title}: ${(e as ApiError).message}`);
      }
    }
    drop(done);
    setNotice(`Đã xác minh ${done.length}/${list.length}.`);
    if (failed.length) setError(failed.join(' · '));
    setBusy(false);
    router.refresh();
  }

  const allOn = items.length > 0 && items.every((i) => selected.has(i.id));
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Chờ duyệt"
        description={isAdmin ? 'Nội dung và tư liệu thành viên đã gửi, cũ nhất trước.' : 'Nội dung và tư liệu đang chờ Quản trị xác minh.'}
        action={
          isAdmin &&
          selected.size > 0 && (
            <Button disabled={busy} onClick={approveSelected}>
              Xác minh {selected.size} mục đã chọn
            </Button>
          )
        }
      />
      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <ClipboardCheck size={40} strokeWidth={1.5} className="text-ink-mute" aria-hidden />
          <p className="text-body-md text-ink-mute">Không có nội dung nào đang chờ duyệt.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full min-w-[640px]">
            <thead className={tableHead}>
              <tr>
                {isAdmin && (
                  <th className="w-10">
                    <input type="checkbox" aria-label="Chọn tất cả" className="accent-primary" checked={allOn} onChange={() => setSelected(allOn ? new Set() : new Set(items.map((i) => i.id)))} />
                  </th>
                )}
                <th>Nội dung</th>
                <th>Người gửi</th>
                <th>Gửi lúc</th>
                <th className="text-right">{isAdmin ? 'Thao tác' : 'Trạng thái'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className={tableRow}>
                  {isAdmin && (
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Chọn ${i.title}`}
                        className="accent-primary"
                        checked={selected.has(i.id)}
                        onChange={() => setSelected((s) => {
                          const n = new Set(s);
                          if (n.has(i.id)) n.delete(i.id);
                          else n.add(i.id);
                          return n;
                        })}
                      />
                    </td>
                  )}
                  <td>
                    <div className="flex items-center gap-3">
                      {i.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img loading="lazy" decoding="async" src={i.thumbnailUrl} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                      ) : (
                        <span className="size-10 shrink-0 rounded-md bg-canvas-section" aria-hidden />
                      )}
                      <div className="min-w-0">
                        <Link href={href(orgId, i)} className="font-semibold hover:text-primary">
                          {i.title}
                        </Link>
                        <p className="text-caption text-ink-mute">{TYPE_LABELS[i.type]}</p>
                      </div>
                    </div>
                  </td>
                  <td>{i.submittedBy?.name ?? ''}</td>
                  <td className="tabular whitespace-nowrap text-ink-mute">{when(i.submittedAt)}</td>
                  <td className="text-right">
                    {isAdmin ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" disabled={busy} onClick={() => one(i, 'approve')}>
                          Xác minh
                        </Button>
                        <Button size="sm" variant="secondary" disabled={busy} onClick={() => one(i, 'return')}>
                          Trả lại
                        </Button>
                      </div>
                    ) : (
                      <span className="text-body-md text-ink-mute">Đang chờ Quản trị xác minh</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
