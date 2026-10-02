import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntity } from '@/lib/queries';
import { EntityView } from '../../entity-view';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEntity('STORY', (await params).slug);
  return e ? { title: `${e.title} · ${e.companyName} · Culture Atlas`, description: e.summary?.slice(0, 160) } : {};
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEntity('STORY', (await params).slug);
  if (!e) notFound();
  return <EntityView e={e} label={e.subtitle} />;
}
