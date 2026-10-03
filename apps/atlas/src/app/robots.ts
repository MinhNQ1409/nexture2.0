import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  if (process.env.DEMO_MODE === 'true') return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/lang', '/search'] }, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
