import { SignupForm } from './form';

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <SignupForm next={(await searchParams).next} />;
}
