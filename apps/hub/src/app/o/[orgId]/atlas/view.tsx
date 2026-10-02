'use client';
// Culture Atlas page in Hub (06 §12): profile card with the on/off switch, then counts.
import Link from 'next/link';
import { useState } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import { Alert, Badge, Button, Card, PageHeader, linkButton, tableHead, tableRow } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';

type Counts = { stories: number; events: number; people: number; products: number; media: number };
type Status = {
  enabled: boolean;
  hiddenReason: string | null;
  profileUrl: string | null;
  profileComplete: boolean;
  missingFields: string[];
  counts: { live: Counts; waitingOrg: Counts; hidden: Counts };
  verifiedNotPublic: Counts;
};
const FIELD_LABELS: Record<string, string> = { name: 'Tên', logoMediaId: 'Logo', foundedYear: 'Năm thành lập', industryCode: 'Ngành nghề', provinceCode: 'Tỉnh/Thành phố', shortDescVi: 'Mô tả ngắn' };
const TYPES: [keyof Counts, string][] = [
  ['stories', 'Câu chuyện'],
  ['events', 'Sự kiện'],
  ['people', 'Con người'],
  ['products', 'Sản phẩm & Dự án'],
  ['media', 'Tư liệu'],
];

export function AtlasView({ org, initial }: { org: { id: string; name: string; slug: string; slugLocked: boolean; logoUrl: string | null; canToggle: boolean }; initial: Status }) {
  const [s, setS] = useState(initial);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const [showMissing, setShowMissing] = useState(false);

  async function toggle() {
    if (!s.enabled && !s.profileComplete) return setShowMissing(true);
    const msg = s.enabled
      ? 'Toàn bộ hồ sơ và nội dung sẽ bị gỡ khỏi Atlas. Dữ liệu trong Hub giữ nguyên.'
      : org.slugLocked
        ? 'Hồ sơ và mọi nội dung đã công khai sẽ hiện trên Atlas.'
        : `Sau khi bật, đường dẫn ${org.slug} sẽ được khóa và không đổi được nữa.`;
    if (!confirm(msg)) return;
    setBusy(true);
    setError(null);
    try {
      setS(await api<Status>(`/orgs/${org.id}/atlas`, { method: 'PUT', json: { enabled: !s.enabled } }));
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  const state = s.hiddenReason ? (
    <Badge tone="error">Bị NexTure ẩn: {s.hiddenReason}</Badge>
  ) : s.enabled ? (
    <Badge tone="success">Đang hiển thị</Badge>
  ) : (
    <Badge>Chưa bật</Badge>
  );

  return (
    <div className="mx-auto flex w-full max-w-standard flex-col gap-4">
      <PageHeader title="Culture Atlas" description="Những gì doanh nghiệp đang chia sẻ công khai trên Culture Atlas." />
      {error && <Alert>{error.message}</Alert>}
      <Card className="flex flex-col gap-4 md:flex-row md:items-center">
        {org.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" decoding="async" src={org.logoUrl} alt="" className="size-16 rounded-md border border-hairline object-contain" />
        ) : (
          <span className="inline-flex size-16 items-center justify-center rounded-md bg-primary-light text-primary">
            <Building2 size={32} strokeWidth={1.5} aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-heading-md">{org.name}</h2>
            {state}
          </div>
          <p className="truncate text-caption text-ink-mute">/companies/{org.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {s.profileUrl && (
            <a className={linkButton('ghost-primary')} href={s.profileUrl} target="_blank" rel="noopener">
              Xem như khách
              <ExternalLink size={16} strokeWidth={1.5} aria-hidden />
            </a>
          )}
          {org.canToggle && (
            <Button variant={s.enabled ? 'secondary' : 'primary'} disabled={busy} onClick={toggle}>
              {s.enabled ? 'Tắt hồ sơ trên Atlas' : 'Bật hồ sơ trên Atlas'}
            </Button>
          )}
        </div>
      </Card>

      {showMissing && !s.profileComplete && (
        <Card section>
          <p className="font-semibold">Hồ sơ còn thiếu trước khi bật Atlas:</p>
          <ul className="mt-2 list-inside list-disc text-body-md">
            {s.missingFields.map((f) => (
              <li key={f}>{FIELD_LABELS[f] ?? f}</li>
            ))}
          </ul>
          <Link href={`/o/${org.id}/settings/profile`} className="mt-3 inline-block text-link underline hover:text-link-hover">
            Bổ sung hồ sơ doanh nghiệp
          </Link>
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas-white shadow-card">
        <table className="w-full min-w-[640px] text-body-md">
          <thead className={tableHead}>
            <tr>
              <th>Loại</th>
              <th>Đang trên Atlas</th>
              <th>Chờ bật hồ sơ</th>
              <th>Bị ẩn</th>
              <th>Đã xác minh, chưa công khai</th>
            </tr>
          </thead>
          <tbody>
            {TYPES.map(([k, label]) => (
              <tr key={k} className={tableRow}>
                <td className="font-semibold">{label}</td>
                <td className="tabular">{s.counts.live[k]}</td>
                <td className="tabular">{s.counts.waitingOrg[k]}</td>
                <td className="tabular">{s.counts.hidden[k]}</td>
                <td className="tabular">{s.verifiedNotPublic[k]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
