// No-JS fallback for the language switch: sets the cookie and goes back to the page.
import { NextResponse, type NextRequest } from 'next/server';
import { LANG_COOKIE } from '@/lib/i18n';

export function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get('to') === 'en' ? 'en' : 'vi';
  const next = req.nextUrl.searchParams.get('next') ?? '/';
  const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const res = NextResponse.redirect(new URL(safe, req.url), 303);
  res.cookies.set(LANG_COOKIE, to, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return res;
}
