export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/nexture-logo.png" alt="NexTure" width={160} height={83} className="mb-3" />
          <p className="font-display text-heading-lg text-primary">Culture Hub</p>
          <p className="mt-1 text-caption text-ink-mute">Không gian lưu giữ văn hóa doanh nghiệp</p>
        </div>
        {children}
      </div>
    </main>
  );
}
