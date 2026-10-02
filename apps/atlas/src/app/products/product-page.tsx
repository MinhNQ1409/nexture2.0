// /products/[slug] and /projects/[slug] (07 §7, §9: the other prefix redirects with 308).
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PP_STATUS_LABELS, type PpStatus } from '@nexture/contracts';
import { getEntity } from '@/lib/queries';
import { EntityView } from '../entity-view';

type Kind = 'PRODUCT' | 'PROJECT';
const OTHER: Record<Kind, Kind> = { PRODUCT: 'PROJECT', PROJECT: 'PRODUCT' };

export async function productMetadata(kind: Kind, slug: string): Promise<Metadata> {
  const e = await getEntity(kind, slug);
  return e ? { title: `${e.title} · ${e.companyName} · Culture Atlas`, description: e.summary?.slice(0, 160) } : {};
}

export async function ProductPage({ kind, slug }: { kind: Kind; slug: string }) {
  const e = await getEntity(kind, slug);
  if (!e) {
    const other = await getEntity(OTHER[kind], slug);
    if (other) permanentRedirect(`/${OTHER[kind] === 'PRODUCT' ? 'products' : 'projects'}/${slug}`);
    notFound();
  }
  const status = PP_STATUS_LABELS[e.extra.status as PpStatus];
  return <EntityView e={e} label={[e.subtitle, status].filter(Boolean).join(' · ')} />;
}
