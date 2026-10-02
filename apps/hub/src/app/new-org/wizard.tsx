'use client';
// 3-step wizard; one POST /orgs at the end (06-hub-man-hinh §3).
import { useEffect, useState } from 'react';
import { EMPLOYEE_SIZES, INDUSTRIES, PROVINCES } from '@nexture/contracts';
import { Alert, Button, Card, Field, Input, Select, Textarea } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';
import { toSlug } from '@/lib/slug';

type Value = { nameVi: string; descriptionVi: string };
const STEPS = ['Thông tin cơ bản', 'Người sáng lập', 'Giá trị cốt lõi'];
const atlasHost = (process.env.NEXT_PUBLIC_ATLAS_BASE_URL ?? 'atlas').replace(/^https?:\/\//, '');

export function NewOrgWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugMsg, setSlugMsg] = useState<string | null>(null);
  const [profile, setProfile] = useState({ foundedYear: '', industryCode: '', employeeSize: '', provinceCode: '', website: '', shortDescVi: '' });
  const [founders, setFounders] = useState<string[]>(['']);
  const [values, setValues] = useState<Value[]>([{ nameVi: '', descriptionVi: '' }]);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(toSlug(name));
  }, [name, slugTouched]);

  useEffect(() => {
    if (!slug) return setSlugMsg(null);
    const h = setTimeout(async () => {
      const r = await api<{ available: boolean; suggestion: string }>(`/orgs/slug-availability?slug=${encodeURIComponent(slug)}`).catch(() => null);
      setSlugMsg(r && !r.available ? `Đã có doanh nghiệp dùng đường dẫn này. Gợi ý: ${r.suggestion}` : null);
    }, 400);
    return () => clearTimeout(h);
  }, [slug]);

  const set = (k: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setProfile({ ...profile, [k]: e.target.value });
  const fieldErr = (k: string) => (error?.details?.fields as Record<string, string> | undefined)?.[k];

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const org = await api<{ id: string }>('/orgs', {
        method: 'POST',
        json: {
          name,
          slug,
          foundedYear: profile.foundedYear ? Number(profile.foundedYear) : null,
          industryCode: profile.industryCode || null,
          employeeSize: profile.employeeSize || null,
          provinceCode: profile.provinceCode || null,
          website: profile.website || null,
          shortDescVi: profile.shortDescVi || null,
          founderNames: founders.map((f) => f.trim()).filter(Boolean),
          values: values.filter((v) => v.nameVi.trim()).map((v) => ({ nameVi: v.nameVi, descriptionVi: v.descriptionVi || null })),
        },
      });
      window.location.href = `/o/${org.id}/dashboard?created=1`;
    } catch (e) {
      setError(e as ApiError);
      setStep(0);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card welcome className="space-y-6">
      <div>
        <h1 className="text-display-md">Tạo Culture Hub</h1>
        <ol className="mt-4 flex gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex-1 border-t-4 pt-2 text-caption ${i <= step ? 'border-primary text-ink' : 'border-hairline text-ink-mute'}`}>
              {i + 1}. {s}
            </li>
          ))}
        </ol>
      </div>
      {error && <Alert>{error.message}</Alert>}

      {step === 0 && (
        <div className="space-y-4">
          <Field label="Tên doanh nghiệp *" error={fieldErr('name')}>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Đường dẫn trên Atlas *" error={slugMsg ?? fieldErr('slug')} hint={`${atlasHost}/companies/${slug || '...'} · Có thể đổi cho tới khi hồ sơ lên Atlas.`}>
            <Input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Năm thành lập" error={fieldErr('foundedYear')}>
              <Input type="number" min={1800} max={new Date().getFullYear()} value={profile.foundedYear} onChange={set('foundedYear')} />
            </Field>
            <Field label="Ngành nghề">
              <Select value={profile.industryCode} onChange={set('industryCode')}>
                <option value="">Chọn ngành</option>
                {INDUSTRIES.map((i) => (
                  <option key={i.code} value={i.code}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Quy mô nhân sự">
              <Select value={profile.employeeSize} onChange={set('employeeSize')}>
                <option value="">Chọn quy mô</option>
                {EMPLOYEE_SIZES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tỉnh/Thành phố">
              <Select value={profile.provinceCode} onChange={set('provinceCode')}>
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
            <Input value={profile.website} onChange={set('website')} placeholder="example.vn" />
          </Field>
          <Field label={`Mô tả ngắn (${profile.shortDescVi.length}/300)`} error={fieldErr('shortDescVi')}>
            <Textarea maxLength={300} rows={3} value={profile.shortDescVi} onChange={set('shortDescVi')} />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          {founders.map((f, i) => (
            <Input key={i} value={f} placeholder="Họ và tên người sáng lập" onChange={(e) => setFounders(founders.map((x, j) => (j === i ? e.target.value : x)))} />
          ))}
          {founders.length < 5 && (
            <Button variant="secondary" onClick={() => setFounders([...founders, ''])}>
              + Thêm người sáng lập
            </Button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {values.map((v, i) => (
            <div key={i} className="space-y-2 rounded-md bg-canvas-section p-3">
              <Input value={v.nameVi} placeholder="Tên giá trị" onChange={(e) => setValues(values.map((x, j) => (j === i ? { ...x, nameVi: e.target.value } : x)))} />
              <Textarea rows={2} value={v.descriptionVi} placeholder="Mô tả ngắn" onChange={(e) => setValues(values.map((x, j) => (j === i ? { ...x, descriptionVi: e.target.value } : x)))} />
            </div>
          ))}
          {values.length < 10 && (
            <Button variant="secondary" onClick={() => setValues([...values, { nameVi: '', descriptionVi: '' }])}>
              + Thêm giá trị
            </Button>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Quay lại
        </Button>
        {step < 2 ? (
          <Button disabled={!name.trim() || !slug} onClick={() => setStep(step + 1)}>
            {step === 0 ? 'Tiếp tục' : 'Tiếp tục (có thể bỏ qua)'}
          </Button>
        ) : (
          <Button disabled={busy} onClick={submit}>
            Tạo Culture Hub
          </Button>
        )}
      </div>
    </Card>
  );
}
