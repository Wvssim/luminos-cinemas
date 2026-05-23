import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/account', '/auth'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('/')[2] || 'localhost:3000'}/sitemap.xml`,
  };
}
