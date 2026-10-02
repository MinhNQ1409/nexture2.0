'use client';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  return (
    <button
      className="mt-2 text-brand"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = '/login';
      }}
    >
      Đăng xuất
    </button>
  );
}
