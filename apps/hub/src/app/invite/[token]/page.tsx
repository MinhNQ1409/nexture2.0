import Link from 'next/link';
import { ROLE_LABELS } from '@nexture/contracts';
import { AppError, previewInvite } from '@nexture/core';
import { Card, linkButton } from '@/components/ui';
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
      <Card welcome className="flex w-full max-w-[480px] flex-col gap-4">
        {!invite ? (
          <p>Lời mời không còn hiệu lực. Hãy liên hệ người đã mời bạn.</p>
        ) : (
          <>
            <h1 className="text-display-md">Tham gia {invite.organizationName}</h1>
            <p className="text-ink-mute">Vai trò: {ROLE_LABELS[invite.role]}</p>
            {session ? (
              <AcceptButton token={token} />
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link className={linkButton('primary')} href={`/login?next=${next}`}>
                  Đăng nhập để tham gia
                </Link>
                <Link className={linkButton('secondary')} href={`/signup?next=${next}`}>
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
