'use client';
// Creates a sample company with data for every screen, then opens it.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseZap } from 'lucide-react';
import { Alert, Button } from './ui';
import { api, type ApiError } from '@/lib/fetcher';

export function DemoButton({ variant = 'secondary' }: { variant?: 'primary' | 'secondary' }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const { orgId } = await api<{ orgId: string }>('/demo', { method: 'POST' });
      router.push(`/o/${orgId}/dashboard?demo=1`);
      router.refresh();
    } catch (e) {
      setError((e as ApiError).message ?? 'Không tạo được dữ liệu demo.');
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant={variant} disabled={busy} onClick={load}>
        <DatabaseZap size={18} strokeWidth={1.5} aria-hidden />
        {busy ? 'Đang tạo dữ liệu demo...' : 'Tải dữ liệu demo'}
      </Button>
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
