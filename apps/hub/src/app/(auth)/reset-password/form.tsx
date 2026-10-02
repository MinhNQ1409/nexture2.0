'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Button, Card, Field, Input } from '@/components/ui';
import { authClient } from '@/lib/auth-client';

export function ResetForm({ token }: { token?: string }) {
  const [error, setError] = useState<string | null>(token ? null : 'expired');
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const newPassword = String(f.get('password'));
    if (newPassword.length < 8) return setError('Mật khẩu tối thiểu 8 ký tự.');
    if (newPassword !== f.get('confirm')) return setError('Mật khẩu nhập lại không khớp.');
    const { error } = await authClient.resetPassword({ newPassword, token: token! });
    if (error) return setError('expired');
    window.location.href = '/login?reset=1';
  }
  if (error === 'expired') {
    return (
      <Card welcome className="space-y-4">
        <Alert>Liên kết đã hết hạn.</Alert>
        <Link className="text-body-md text-link underline hover:text-link-hover" href="/forgot-password">
          Gửi lại liên kết
        </Link>
      </Card>
    );
  }
  return (
    <Card welcome>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-display-md">Đặt lại mật khẩu</h1>
        <Field label="Mật khẩu mới">
          <Input name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Nhập lại mật khẩu">
          <Input name="confirm" type="password" autoComplete="new-password" required />
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" className="w-full">
          Đặt lại mật khẩu
        </Button>
      </form>
    </Card>
  );
}
