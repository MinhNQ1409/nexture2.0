'use client';
// Creates a sample company with data for every screen, then opens it.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, DatabaseZap } from 'lucide-react';
import { Alert, Button } from './ui';
import { api, type ApiError } from '@/lib/fetcher';

export function DemoButton({ variant = 'secondary', set }: { variant?: 'primary' | 'secondary'; set?: 'corps' }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const { orgId } = await api<{ orgId: string }>('/demo', { method: 'POST', json: set ? { set } : undefined });
      router.push(`/o/${orgId}/dashboard?demo=1`);
      router.refresh();
    } catch (e) {
      setError((e as ApiError).message ?? 'Không tạo được dữ liệu demo.');
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant={variant} loading={busy} onClick={load}>
        {!busy && (set ? <Building size={18} strokeWidth={1.5} aria-hidden /> : <DatabaseZap size={18} strokeWidth={1.5} aria-hidden />)}
        {set ? (busy ? 'Đang nạp Vinamilk, FPT, Vingroup...' : 'Tải 3 tập đoàn mẫu (Vinamilk, FPT, Vingroup)') : busy ? 'Đang tạo dữ liệu demo...' : 'Tải dữ liệu demo'}
      </Button>
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
