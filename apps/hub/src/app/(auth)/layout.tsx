export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <div className="text-center">
          <p className="font-display text-heading-lg text-primary">NexTure Culture Hub</p>
          <p className="mt-1 text-caption text-ink-mute">Không gian lưu giữ văn hóa doanh nghiệp</p>
        </div>
        {children}
      </div>
    </main>
  );
}
