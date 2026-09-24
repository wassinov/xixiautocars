import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// BUG-24 : /robots.txt — public autorisé, espaces privés interdits.
// NOTE : servi hors middleware (le matcher exclut les chemins avec un point).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/login', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
