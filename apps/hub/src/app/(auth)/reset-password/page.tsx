import { ResetForm } from './form';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const sp = await searchParams;
  return <ResetForm token={sp.error ? undefined : sp.token} />;
}
