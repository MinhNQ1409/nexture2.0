export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <p className="text-center font-display text-xl font-semibold text-brand">NexTure Culture Hub</p>
        {children}
      </div>
    </main>
  );
}
