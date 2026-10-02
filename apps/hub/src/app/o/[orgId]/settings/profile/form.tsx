'use client';
// Company profile (06 §14.1): same fields as the wizard + logo. Read-only for non-admins.
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ImageUp, Lock } from 'lucide-react';
import { EMPLOYEE_SIZES, INDUSTRIES, PROVINCES, industryName, provinceName } from '@nexture/contracts';
import type { OrganizationDto } from '@nexture/core';
import { Alert, Button, Card, Field, Input, PageHeader, Select, Textarea } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';
import { uploadFile } from '@/lib/upload';

type Org = OrganizationDto;

export function ProfileForm({ org }: { org: Org }) {
  const router = useRouter();
  const canEdit = org.permissions.canEditProfile;
  const [f, setF] = useState({
    name: org.name,
    slug: org.slug,
    foundedYear: org.foundedYear?.toString() ?? '',
    industryCode: org.industryCode ?? '',
    employeeSize: org.employeeSize ?? '',
    provinceCode: org.provinceCode ?? '',
    website: org.website ?? '',
    shortDescVi: org.shortDescVi ?? '',
    shortDescEn: org.shortDescEn ?? '',
  });
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fieldErr = (k: string) => (error?.details?.fields as Record<string, string> | undefined)?.[k];
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setF({ ...f, [k]: e.target.value });
  };

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await api(`/orgs/${org.id}`, { method: 'PATCH', json: { version: org.version, ...body } });
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  async function onLogo(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const m = await uploadFile(org.id, file);
      await api(`/orgs/${org.id}`, { method: 'PATCH', json: { version: org.version, logoMediaId: m.id } });
      router.refresh();
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  if (!canEdit) {
    const rows = [
      ['Tên doanh nghiệp', org.name],
      ['Năm thành lập', org.foundedYear],
      ['Ngành nghề', industryName(org.industryCode)],
      ['Tỉnh/Thành phố', provinceName(org.provinceCode)],
      ['Website', org.website],
      ['Mô tả ngắn', org.shortDescVi],
    ];
    return (
      <div className="mx-auto flex w-full max-w-standard flex-col gap-4">
        <PageHeader title="Hồ sơ doanh nghiệp" description="Chỉ Quản trị mới sửa được hồ sơ." />
        <Card>
          <dl className="grid gap-3 sm:grid-cols-[200px_1fr]">
            {rows.map(([k, v]) => (
              <div key={String(k)} className="contents">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-ink-mute">{v || 'Chưa có'}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-standard flex-col gap-4">
      <PageHeader title="Hồ sơ doanh nghiệp" description="Thông tin này hiển thị trên Culture Atlas khi bạn bật hồ sơ." />
      {error && <Alert>{error.message}</Alert>}
      {saved && <Alert tone="success">Đã lưu hồ sơ.</Alert>}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="flex flex-col items-center gap-4 lg:col-span-4">
          <h2 className="self-start text-heading-md">Logo</h2>
          {org.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" decoding="async" src={org.logo.url} alt={`Logo ${org.name}`} className="size-32 rounded-lg border border-hairline object-contain" />
          ) : (
            <div className="flex size-32 items-center justify-center rounded-lg border border-dashed border-hairline bg-canvas-section text-caption text-ink-mute">Chưa có logo</div>
          )}
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => onLogo(e.target.files?.[0])} aria-label="Chọn logo" />
          <Button variant="secondary" disabled={busy} onClick={() => fileRef.current?.click()}>
            <ImageUp size={20} strokeWidth={1.5} aria-hidden />
            {org.logo ? 'Đổi logo' : 'Tải logo lên'}
          </Button>
          <p className="text-center text-caption text-ink-mute">PNG, JPG hoặc WEBP, tối đa 20 MB.</p>
        </Card>

        <Card className="flex flex-col gap-4 lg:col-span-8">
          <Field label="Tên doanh nghiệp" error={fieldErr('name')}>
            <Input value={f.name} onChange={set('name')} />
          </Field>
          <Field label="Đường dẫn trên Atlas" error={fieldErr('slug')} hint={org.slugLocked ? 'Đường dẫn đã khóa vì hồ sơ đã lên Atlas.' : 'Có thể đổi cho tới khi hồ sơ lên Atlas.'}>
            <div className="relative">
              <Input value={f.slug} onChange={set('slug')} disabled={org.slugLocked} />
              {org.slugLocked && <Lock size={16} strokeWidth={1.5} className="absolute right-3 top-3.5 text-ink-mute" aria-hidden />}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Năm thành lập" error={fieldErr('foundedYear')}>
              <Input type="number" min={1800} max={new Date().getFullYear()} value={f.foundedYear} onChange={set('foundedYear')} />
            </Field>
            <Field label="Ngành nghề">
              <Select value={f.industryCode} onChange={set('industryCode')}>
                <option value="">Chọn ngành</option>
                {INDUSTRIES.map((i) => (
                  <option key={i.code} value={i.code}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Quy mô nhân sự">
              <Select value={f.employeeSize} onChange={set('employeeSize')}>
                <option value="">Chọn quy mô</option>
                {EMPLOYEE_SIZES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tỉnh/Thành phố">
              <Select value={f.provinceCode} onChange={set('provinceCode')}>
                <option value="">Chọn tỉnh/thành</option>
                {PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Website" error={fieldErr('website')}>
            <Input value={f.website} onChange={set('website')} placeholder="example.vn" />
          </Field>
          <Field label={`Mô tả ngắn (${f.shortDescVi.length}/300)`} error={fieldErr('shortDescVi')}>
            <Textarea rows={3} maxLength={300} value={f.shortDescVi} onChange={set('shortDescVi')} />
          </Field>
          <Field label={`Mô tả ngắn bằng tiếng Anh (${f.shortDescEn.length}/300)`} hint="Hiện trên Atlas khi khách chọn English. Để trống sẽ hiện tiếng Việt." error={fieldErr('shortDescEn')}>
            <Textarea rows={3} maxLength={300} value={f.shortDescEn} onChange={set('shortDescEn')} />
          </Field>
          <div className="flex justify-end">
            <Button
              disabled={busy}
              onClick={() =>
                patch({
                  name: f.name,
                  ...(org.slugLocked ? {} : { slug: f.slug }),
                  foundedYear: f.foundedYear ? Number(f.foundedYear) : null,
                  industryCode: f.industryCode || null,
                  employeeSize: f.employeeSize || null,
                  provinceCode: f.provinceCode || null,
                  website: f.website || null,
                  shortDescVi: f.shortDescVi || null,
                  shortDescEn: f.shortDescEn || null,
                })
              }
            >
              Lưu hồ sơ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
