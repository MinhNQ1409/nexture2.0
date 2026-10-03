// Public addresses and search-engine settings shared by metadata, robots.txt, sitemap.xml and JSON-LD.
export const SITE_URL = (process.env.ATLAS_PUBLIC_URL ?? 'https://nexture-atlas.vercel.app').replace(/\/$/, '');
export const HUB_URL = (process.env.HUB_PUBLIC_URL ?? 'https://nexture-hub.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'NexTure Culture Atlas';
/** Codes from Google Search Console and Bing Webmaster Tools ("HTML tag" verification). */
export const VERIFICATION = {
  google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  bing: process.env.BING_SITE_VERIFICATION || undefined,
};
