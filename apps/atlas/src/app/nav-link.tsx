'use client';
// Header link that shows where the reader is.
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={`inline-flex items-center gap-2 text-body-md font-semibold hover:text-primary ${active ? 'text-primary' : 'text-ink'} ${className}`}>
      {children}
    </Link>
  );
}
