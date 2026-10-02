import type { Metadata } from 'next';
import { ProductPage, productMetadata } from '../../products/product-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return productMetadata('PROJECT', (await params).slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductPage kind="PROJECT" slug={(await params).slug} />;
}
