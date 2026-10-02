import { getOrg } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { ProfileForm } from './form';

export default async function ProfilePage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  return <ProfileForm org={JSON.parse(JSON.stringify(org))} />;
}
