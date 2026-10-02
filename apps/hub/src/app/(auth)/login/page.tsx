import { LoginForm } from './form';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const sp = await searchParams;
  return <LoginForm next={sp.next} justReset={sp.reset === '1'} />;
}
