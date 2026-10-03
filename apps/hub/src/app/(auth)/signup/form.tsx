'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Button, Card, Field, Input } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import { safeNext } from '@/lib/fetcher';

export function SignupForm({ next }: { next?: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name')).trim();
    const email = String(f.get('email')).trim();
    const password = String(f.get('password'));
    const errs: Record<string, string> = {};
    if (name.length < 2 || name.length > 100) errs.name = 'Họ và tên từ 2 đến 100 ký tự.';
    if (password.length < 8) errs.password = 'Mật khẩu tối thiểu 8 ký tự.';
    if (password !== f.get('confirm')) errs.confirm = 'Mật khẩu nhập lại không khớp.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    setBusy(false);
    if (error) {
      return setErrors(error.code === 'USER_ALREADY_EXISTS' || error.status === 422 ? { email: 'Email đã được sử dụng.' } : { _: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
    // Home sends people who were added by email straight into their org, everyone else to /new-org.
    window.location.href = safeNext(next, '/');
  }

  return (
    <Card welcome>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-display-md">Tạo tài khoản</h1>
        <Field label="Họ và tên" error={errors.name}>
          <Input name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Mật khẩu" error={errors.password}>
          <Input name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Nhập lại mật khẩu" error={errors.confirm}>
          <Input name="confirm" type="password" autoComplete="new-password" required />
        </Field>
        {errors._ && <Alert>{errors._}</Alert>}
        <Button type="submit" disabled={busy} className="w-full">
          Đăng ký
        </Button>
        <p className="text-center text-body-md">
          <Link className="text-link underline hover:text-link-hover" href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}>
            Đã có tài khoản? Đăng nhập
          </Link>
        </p>
      </form>
    </Card>
  );
}
