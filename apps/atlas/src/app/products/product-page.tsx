// /products/[slug] and /projects/[slug] (07 §7, §9: the other prefix redirects with 308).
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getEntity } from '@/lib/queries';
import { EntityView } from '../entity-view';
import { getLang, statusLabel } from '@/lib/i18n';

type Kind = 'PRODUCT' | 'PROJECT';
const OTHER: Record<Kind, Kind> = { PRODUCT: 'PROJECT', PROJECT: 'PRODUCT' };

export async function productMetadata(kind: Kind, slug: string): Promise<Metadata> {
  const e = await getEntity(kind, slug, await getLang());
  return e ? { title: `${e.title} · ${e.companyName} · Culture Atlas`, description: e.summary?.slice(0, 160) } : {};
}

export async function ProductPage({ kind, slug }: { kind: Kind; slug: string }) {
  const lang = await getLang();
  const e = await getEntity(kind, slug, lang);
  if (!e) {
    const other = await getEntity(OTHER[kind], slug);
    if (other) permanentRedirect(`/${OTHER[kind] === 'PRODUCT' ? 'products' : 'projects'}/${slug}`);
    notFound();
  }
  const status = statusLabel(e.extra.status, lang);
  return <EntityView e={e} label={[e.subtitle, status].filter(Boolean).join(' · ')} />;
}
