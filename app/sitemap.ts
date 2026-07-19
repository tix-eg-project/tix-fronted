import { MetadataRoute } from 'next'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tix-eg.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

function generateSlug(name: string): string {
  return (name || '').trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w؀-ۿ-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

const staticPages: MetadataRoute.Sitemap = [
  { url: BASE_URL,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE_URL}/products`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/offers`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE_URL}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/terms`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/privacy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/return-policy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
]

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Load prebuild slug map (has correct slugs for known products)
  let slugMap: Record<string, string> = {}
  try {
    const mapPath = join(process.cwd(), 'lib', 'product-slug-map.json')
    if (existsSync(mapPath)) {
      slugMap = JSON.parse(readFileSync(mapPath, 'utf-8'))
    }
  } catch {}

  let productPages: MetadataRoute.Sitemap = []

  try {
    const res = await fetch(`${API_URL}/api/products?per_page=500`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data = await res.json()
      const products: { id: number; slug?: string; name?: string | { ar?: string; en?: string } }[] = data?.data || []

      productPages = products
        .map((p) => {
          const id = String(p.id)
          // prefer prebuild JSON slug → then API slug → then generate from name
          const nameStr = typeof p.name === 'string'
            ? p.name
            : (p.name as { ar?: string; en?: string })?.ar || (p.name as { ar?: string; en?: string })?.en || ''
          const slug = slugMap[id] || p.slug || generateSlug(nameStr)
          if (!slug) return null
          return {
            url: `${BASE_URL}/product/${slug}/${p.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
          }
        })
        .filter((p): p is MetadataRoute.Sitemap[number] => p !== null)
    }
  } catch {
    // fallback to prebuild JSON only
    productPages = Object.entries(slugMap).map(([id, slug]) => ({
      url: `${BASE_URL}/product/${slug}/${id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  }

  return [...staticPages, ...productPages]
}
