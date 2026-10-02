'use client';
// Switches the Atlas language in place: sets the cookie and re-renders the current page on the server.
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Languages, LoaderCircle } from 'lucide-react';

export function LangSwitch({ to, label, title }: { to: 'vi' | 'en'; label: string; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <a
      href={`/lang?to=${to}&next=${encodeURIComponent(pathname)}`}
      lang={to}
      title={title}
      aria-label={title}
      aria-busy={pending}
      onClick={(ev) => {
        ev.preventDefault();
        document.cookie = `atlas_lang=${to}; path=/; max-age=31536000; samesite=lax`;
        start(() => router.refresh());
      }}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-hairline-strong px-2.5 text-body-md font-semibold text-ink hover:border-primary hover:text-primary"
    >
      {pending ? <LoaderCircle size={16} strokeWidth={1.5} className="animate-spin" aria-hidden /> : <Languages size={16} strokeWidth={1.5} aria-hidden />}
      <span>{label}</span>
    </a>
  );
}
