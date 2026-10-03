import type { MetadataRoute } from 'next';

const HUB_URL = (process.env.HUB_BASE_URL ?? 'https://nexture-hub.vercel.app').replace(/\/$/, '');

// Only the public entry pages may be crawled; every workspace page sits behind sign-in.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: ['/login', '/signup', '/brand/', '/google3d5a7c6b6dd4fa41.html'], disallow: '/' }, sitemap: `${HUB_URL}/sitemap.xml` };
}
