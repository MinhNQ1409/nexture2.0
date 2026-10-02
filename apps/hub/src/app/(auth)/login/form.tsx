'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Button, Card, Field, Input } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import { safeNext } from '@/lib/fetcher';

export function LoginForm({ next, justReset }: { next?: string; justReset: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email: String(f.get('email')), password: String(f.get('password')) });
    setBusy(false);
    if (error) return setError('Email hoặc mật khẩu không đúng.');
    window.location.href = safeNext(next);
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">Đăng nhập</h1>
        {justReset && <Alert tone="success">Đã đặt lại mật khẩu.</Alert>}
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Mật khẩu">
          <div className="flex gap-2">
            <Input name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required />
            <Button type="button" variant="secondary" onClick={() => setShow(!show)}>
              {show ? 'Ẩn' : 'Hiện'}
            </Button>
          </div>
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" disabled={busy} className="w-full">
          Đăng nhập
        </Button>
        <div className="flex justify-between text-sm">
          <Link className="text-brand" href="/forgot-password">
            Quên mật khẩu?
          </Link>
          <Link className="text-brand" href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}>
            Chưa có tài khoản? Đăng ký
          </Link>
        </div>
      </form>
    </Card>
  );
}
