import Link from 'next/link';
import { ROLE_LABELS } from '@nexture/contracts';
import { AppError, previewInvite } from '@nexture/core';
import { Card } from '@/components/ui';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { AcceptButton } from './accept';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await previewInvite(db(), token).catch((e) => {
    if (e instanceof AppError) return null;
    throw e;
  });
  const session = await getSession();
  const next = encodeURIComponent(`/invite/${token}`);
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4">
        {!invite ? (
          <p>Lời mời không còn hiệu lực. Hãy liên hệ người đã mời bạn.</p>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold">Tham gia {invite.organizationName}</h1>
            <p className="text-text-muted">Vai trò: {ROLE_LABELS[invite.role]}</p>
            {session ? (
              <AcceptButton token={token} />
            ) : (
              <div className="flex gap-3">
                <Link className="rounded-md bg-brand px-4 py-2 text-sm text-on-brand" href={`/login?next=${next}`}>
                  Đăng nhập để tham gia
                </Link>
                <Link className="rounded-md border border-border px-4 py-2 text-sm" href={`/signup?next=${next}`}>
                  Tạo tài khoản
                </Link>
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  );
}
