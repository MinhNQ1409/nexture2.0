import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntity } from '@/lib/queries';
import { EntityView } from '../../entity-view';
import { getLang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEntity('EVENT', (await params).slug, await getLang());
  return e ? { title: `${e.title} · ${e.companyName} · Culture Atlas`, description: e.summary?.slice(0, 160) } : {};
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEntity('EVENT', (await params).slug, await getLang());
  if (!e) notFound();
  return <EntityView e={e} label={e.subtitle} />;
}
