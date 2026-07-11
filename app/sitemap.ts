import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tix-eg.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

async function fetchAllProducts(): Promise<{ id: number; updated_at?: string }[]> {
  const results: { id: number; updated_at?: string }[] = []
  let page = 1
  try {
    while (true) {
      const res = await fetch(`${API_URL}/api/products?page=${page}&per_page=100`, {
        headers: { Accept: 'application/json', 'Accept-Language': 'ar' },
        next: { revalidate: 3600 },
      })
      if (!res.ok) break
      const data = await res.json()
      const items: any[] = data.data?.data ?? data.data ?? []
      if (!items.length) break
      results.push(...items.map((p: any) => ({ id: p.id, updated_at: p.updated_at })))
      const lastPage: number = data.data?.last_page ?? data.meta?.last_page ?? 1
      if (page >= lastPage) break
      page++
    }
  } catch {
    // Return whatever we got on error
  }
  return results
}

async function fetchAllCategories(): Promise<{ id: number; slug?: string; updated_at?: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      headers: { Accept: 'application/json', 'Accept-Language': 'ar' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                        lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/products`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/offers`,            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/about`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/privacy`,           lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/return-policy`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const [products, categories] = await Promise.all([
    fetchAllProducts(),
    fetchAllCategories(),
  ])

  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${BASE_URL}/products?category=${c.id}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}
