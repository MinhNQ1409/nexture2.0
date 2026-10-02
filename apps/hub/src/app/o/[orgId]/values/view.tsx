'use client';
// Culture values (06 §9): cards in sort order; admin adds, edits, reorders and deletes.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Gem, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ValueDto } from '@nexture/core';
import { Alert, Badge, Button, Card, Field, Input, PageHeader, Textarea } from '@/components/ui';
import { api, type ApiError } from '@/lib/fetcher';

type Draft = { nameVi: string; descriptionVi: string; nameEn: string; descriptionEn: string; isPublic: boolean };
const empty: Draft = { nameVi: '', descriptionVi: '', nameEn: '', descriptionEn: '', isPublic: false };

function ValueForm({ initial, busy, onSave, onCancel }: { initial: Draft; busy: boolean; onSave: (d: Draft) => void; onCancel: () => void }) {
  const [d, setD] = useState(initial);
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(d);
      }}
    >
      <Field label="Tên giá trị *">
        <Input autoFocus value={d.nameVi} maxLength={100} onChange={(e) => setD({ ...d, nameVi: e.target.value })} />
      </Field>
      <Field label={`Mô tả (${d.descriptionVi.length}/1000)`}>
        <Textarea rows={3} maxLength={1000} value={d.descriptionVi} onChange={(e) => setD({ ...d, descriptionVi: e.target.value })} />
      </Field>
      <details className="rounded-md border border-hairline" open={Boolean(d.nameEn || d.descriptionEn)}>
        <summary className="cursor-pointer px-3 py-2 text-body-md font-semibold">Tiếng Anh cho Atlas (không bắt buộc)</summary>
        <div className="flex flex-col gap-3 border-t border-hairline p-3">
          <Field label="Name">
            <Input value={d.nameEn} maxLength={100} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={2} maxLength={1000} value={d.descriptionEn} onChange={(e) => setD({ ...d, descriptionEn: e.target.value })} />
          </Field>
        </div>
      </details>
      <label className="flex w-fit items-center gap-2 text-body-md">
        <input type="checkbox" className="size-4 accent-primary" checked={d.isPublic} onChange={(e) => setD({ ...d, isPublic: e.target.checked })} />
        Hiển thị trên hồ sơ Atlas
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={busy || !d.nameVi.trim()}>
          Lưu
        </Button>
      </div>
    </form>
  );
}

export function ValuesView({ orgId, canManage, initial }: { orgId: string; canManage: boolean; initial: ValueDto[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      const r = await api<{ items: ValueDto[] }>(`/orgs/${orgId}/values`);
      setItems(r.items);
      setEditing(null);
      router.refresh();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  const body = (d: Draft) => ({ nameVi: d.nameVi, descriptionVi: d.descriptionVi || null, nameEn: d.nameEn.trim() || null, descriptionEn: d.descriptionEn.trim() || null, visibility: d.isPublic ? 'PUBLIC' : 'INTERNAL' });
  const move = (i: number, by: number) => {
    const ids = items.map((v) => v.id);
    const [x] = ids.splice(i, 1);
    ids.splice(i + by, 0, x!);
    return run(() => api(`/orgs/${orgId}/values/order`, { method: 'PUT', json: { ids } }));
  };

  return (
    <div className="mx-auto flex w-full max-w-standard flex-col gap-4">
      <PageHeader
        title="Giá trị văn hóa"
        description="Những điều doanh nghiệp tin và làm theo. Giá trị công khai hiện trên hồ sơ Atlas."
        action={
          canManage &&
          editing !== 'new' && (
            <Button onClick={() => setEditing('new')}>
              <Plus size={20} strokeWidth={1.5} aria-hidden />
              Thêm giá trị
            </Button>
          )
        }
      />
      {error && <Alert>{error}</Alert>}
      {editing === 'new' && (
        <Card>
          <ValueForm initial={empty} busy={busy} onCancel={() => setEditing(null)} onSave={(d) => run(() => api(`/orgs/${orgId}/values`, { method: 'POST', json: body(d) }))} />
        </Card>
      )}
      {items.length === 0 && editing !== 'new' ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-hairline bg-canvas-white p-12 text-center">
          <Gem size={32} strokeWidth={1.5} className="text-ink-subtle" aria-hidden />
          <p className="text-body-lg text-ink-mute">Chưa có giá trị văn hóa nào.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((v, i) => (
            <li key={v.id}>
              <Card className="border-l-4 border-l-primary">
                {editing === v.id ? (
                  <ValueForm
                    initial={{ nameVi: v.nameVi, descriptionVi: v.descriptionVi ?? '', nameEn: v.nameEn ?? '', descriptionEn: v.descriptionEn ?? '', isPublic: v.visibility === 'PUBLIC' }}
                    busy={busy}
                    onCancel={() => setEditing(null)}
                    onSave={(d) => run(() => api(`/orgs/${orgId}/values/${v.id}`, { method: 'PATCH', json: { version: v.version, ...body(d) } }))}
                  />
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-heading-sm">{v.nameVi}</h2>
                        {v.visibility === 'PUBLIC' ? (
                          <Badge tone="info">
                            <Globe size={12} strokeWidth={1.5} aria-hidden />
                            Công khai
                          </Badge>
                        ) : (
                          <Badge>Nội bộ</Badge>
                        )}
                      </div>
                      {v.descriptionVi && <p className="mt-1 text-body-md text-ink-mute">{v.descriptionVi}</p>}
                      <p className="mt-2 flex gap-4 text-body-md">
                        <Link href={`/o/${orgId}/stories?valueId=${v.id}`} className="text-link hover:text-link-hover">
                          {v.storyCount} câu chuyện
                        </Link>
                        <Link href={`/o/${orgId}/events?valueId=${v.id}`} className="text-link hover:text-link-hover">
                          {v.eventCount} sự kiện
                        </Link>
                      </p>
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" variant="ghost" aria-label="Lên trên" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                          <ArrowUp size={16} strokeWidth={1.5} aria-hidden />
                        </Button>
                        <Button size="sm" variant="ghost" aria-label="Xuống dưới" disabled={busy || i === items.length - 1} onClick={() => move(i, 1)}>
                          <ArrowDown size={16} strokeWidth={1.5} aria-hidden />
                        </Button>
                        <Button size="sm" variant="ghost" aria-label="Sửa" disabled={busy} onClick={() => setEditing(v.id)}>
                          <Pencil size={16} strokeWidth={1.5} aria-hidden />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Xóa"
                          className="text-error"
                          disabled={busy}
                          onClick={() => confirm(`Xóa "${v.nameVi}"? Các liên kết với câu chuyện và sự kiện sẽ bị gỡ.`) && run(() => api(`/orgs/${orgId}/values/${v.id}`, { method: 'DELETE' }))}
                        >
                          <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
