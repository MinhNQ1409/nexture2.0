'use client';
import { useState } from 'react';
import { Alert, Button, Card, Field, Input } from '@/components/ui';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email'));
    await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' });
    // Same message whether or not the email exists (06 §2.3).
    setSent(true);
  }
  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">Quên mật khẩu</h1>
        {sent ? (
          <Alert tone="success">Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.</Alert>
        ) : (
          <>
            <Field label="Email">
              <Input name="email" type="email" required />
            </Field>
            <Button type="submit" className="w-full">
              Gửi hướng dẫn
            </Button>
          </>
        )}
      </form>
    </Card>
  );
}
