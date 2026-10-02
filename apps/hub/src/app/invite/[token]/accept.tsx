'use client';
import { useState } from 'react';
import { Alert, Button } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import { api, type ApiError } from '@/lib/fetcher';

export function AcceptButton({ token }: { token: string }) {
  const [error, setError] = useState<ApiError | null>(null);
  async function accept() {
    try {
      const r = await api<{ orgId: string }>(`/invites/${token}/accept`, { method: 'POST' });
      window.location.href = `/o/${r.orgId}/dashboard`;
    } catch (e) {
      const err = e as ApiError;
      if (err.code === 'ALREADY_MEMBER') window.location.href = `/o/${String(err.details?.orgId)}/dashboard`;
      else setError(err);
    }
  }
  return (
    <div className="space-y-3">
      <Button onClick={accept}>Tham gia</Button>
      {error && <Alert>{error.message}</Alert>}
      {error?.code === 'INVITE_EMAIL_MISMATCH' && (
        <Button
          variant="secondary"
          onClick={async () => {
            await authClient.signOut();
            window.location.reload();
          }}
        >
          Đăng xuất
        </Button>
      )}
    </div>
  );
}
