import { MetadataRoute } from 'next'

const BASE_URL   = process.env.NEXT_PUBLIC_SITE_URL || 'https://tix-eg.com'
const API_URL    = process.env.NEXT_PUBLIC_API_URL  || 'https://admin.tix-eg.com'

const staticPages: MetadataRoute.Sitemap = [
  { url: BASE_URL,                      lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE_URL}/products`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/offers`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE_URL}/about`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/contact`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/terms`,           lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/privacy`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/return-policy`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/api/sitemap/products`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const products: Array<{
        loc: string
        lastmod?: string
        changefreq?: string
        priority?: number
      }> = await res.json()

      const productPages: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${BASE_URL}${p.loc}`,
        lastModified: p.lastmod ? new Date(p.lastmod) : new Date(),
        changeFrequency: (p.changefreq as MetadataRoute.Sitemap[number]['changeFrequency']) ?? 'weekly',
        priority: p.priority ?? 0.8,
      }))

      return [...staticPages, ...productPages]
    }
  } catch {
    // Fall back to static pages only on error
  }

  return staticPages
}
