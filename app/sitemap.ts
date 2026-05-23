import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000';
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/programme`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/prochainement`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/salles`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
