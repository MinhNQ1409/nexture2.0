'use client';
// Media library (06 §10): grid of the org's documents with filters and multi-file upload.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Images, Search, Upload } from 'lucide-react';
import { MEDIA_KIND_LABELS, STATUS_LABELS, VISIBILITY_LABELS } from '@nexture/contracts';
import { StatusBadge, VisibilityBadge } from '@/components/badges';
import { MediaThumb } from '@/components/media-picker';
import { Alert, Button, Card, PageHeader, Select } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';
import { uploadFile } from '@/lib/upload';

type Item = { id: string; title: string; kind: string; url: string; sizeBytes: number; status: 'DRAFT' | 'PENDING_REVIEW' | 'VERIFIED'; visibility: 'PRIVATE' | 'INTERNAL' | 'PUBLIC' };
type Page = { items: Item[]; total: number; page: number; pageSize: number };

const ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf,video/mp4,audio/mpeg';
const sizeLabel = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function LibraryView({ orgId, canUpload, initial }: { orgId: string; canUpload: boolean; initial: Page }) {
  const [data, setData] = useState(initial);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [visibility, setVisibility] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      const sp = new URLSearchParams({ page: String(page), pageSize: '48' });
      if (q.trim().length >= 2) sp.set('q', q.trim());
      if (kind) sp.set('kind', kind);
      if (status) sp.set('status', status);
      if (visibility) sp.set('visibility', visibility);
      try {
        setData(await api<Page>(`/orgs/${orgId}/media?${sp}`));
      } catch (e) {
        setError((e as ApiError).message);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [orgId, q, kind, status, visibility, page, tick]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = [...files];
    const failed: string[] = [];
    for (const [i, f] of list.entries()) {
      setProgress(`Đang tải lên ${i + 1}/${list.length}: ${f.name}`);
      try {
        await uploadFile(orgId, f);
      } catch (e) {
        failed.push(`${f.name}: ${(e as ApiError).message}`);
      }
    }
    setProgress(null);
    if (failed.length) setError(failed.join(' · '));
    if (fileRef.current) fileRef.current.value = '';
    setPage(1);
    setTick((x) => x + 1);
  }

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const filtered = Boolean(q.trim() || kind || status || visibility);
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Thư viện tư liệu"
        description="Ảnh, tài liệu và video của doanh nghiệp. Tư liệu chỉ lên Atlas khi đã xác minh, công khai và được dùng làm ảnh bìa hoặc trong bộ ảnh."
        action={
          canUpload && (
            <>
              <input ref={fileRef} type="file" multiple accept={ACCEPT} className="sr-only" aria-label="Chọn tệp để tải lên" onChange={(e) => upload(e.target.files)} />
              <Button disabled={Boolean(progress)} onClick={() => fileRef.current?.click()}>
                <Upload size={16} strokeWidth={1.5} aria-hidden />
                Tải lên
              </Button>
            </>
          )
        }
      />
      {error && <Alert>{error}</Alert>}
      {progress && <p className="text-body-md text-ink-mute">{progress}</p>}

      <div className="flex flex-wrap gap-2">
        <label className="flex min-h-11 min-w-0 flex-1 basis-60 items-center gap-2 rounded-md border border-hairline bg-canvas-white px-3">
          <Search size={16} strokeWidth={1.5} className="text-ink-mute" aria-hidden />
          <input value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} placeholder="Tìm theo tên hoặc thẻ" className="w-full bg-transparent text-body-md outline-none" />
        </label>
        <div className="w-40">
          <Select aria-label="Loại" value={kind} onChange={(e) => (setKind(e.target.value), setPage(1))}>
            <option value="">Mọi loại</option>
            {Object.entries(MEDIA_KIND_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <Select aria-label="Trạng thái" value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))}>
            <option value="">Mọi trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select aria-label="Hiển thị" value={visibility} onChange={(e) => (setVisibility(e.target.value), setPage(1))}>
            <option value="">Mọi mức hiển thị</option>
            {Object.entries(VISIBILITY_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {data.items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <Images size={40} strokeWidth={1.5} className="text-ink-mute" aria-hidden />
          <p className="text-body-md text-ink-mute">{filtered ? 'Không có tư liệu phù hợp với bộ lọc.' : 'Thư viện chưa có tư liệu nào. Hãy tải lên ảnh đầu tiên.'}</p>
        </Card>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((m) => (
            <li key={m.id}>
              <Link href={`/o/${orgId}/library/${m.id}`} className="group flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-canvas-white hover:border-primary">
                <MediaThumb m={m} className="aspect-[4/3] w-full" />
                <span className="flex flex-col gap-2 p-3">
                  <span className="truncate font-semibold group-hover:text-primary">{m.title}</span>
                  <span className="text-caption text-ink-mute">
                    {MEDIA_KIND_LABELS[m.kind as keyof typeof MEDIA_KIND_LABELS]} · {sizeLabel(m.sizeBytes)}
                  </span>
                  <span className="flex flex-wrap gap-1">
                    <StatusBadge status={m.status} />
                    <VisibilityBadge visibility={m.visibility} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Trang trước
          </Button>
          <span className="text-body-md text-ink-mute">
            Trang {page}/{pages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
