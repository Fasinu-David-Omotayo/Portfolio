export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fasinu-david-omotayo.vercel.app';
  return [{ url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}