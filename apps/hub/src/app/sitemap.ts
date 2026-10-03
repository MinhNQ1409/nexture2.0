import type { MetadataRoute } from 'next';

const HUB_URL = (process.env.HUB_BASE_URL ?? 'https://nexture-hub.vercel.app').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${HUB_URL}/login`, changeFrequency: 'monthly', priority: 1 },
    { url: `${HUB_URL}/signup`, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
