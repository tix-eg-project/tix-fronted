import { MetadataRoute } from 'next'
import slugMapJson from '@/lib/product-slug-map.json'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tix-eg.com'
const slugMap = slugMapJson as Record<string, string>

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

export default function sitemap(): MetadataRoute.Sitemap {
  const productPages: MetadataRoute.Sitemap = Object.entries(slugMap).map(([id, slug]) => ({
    url: `${BASE_URL}/product/${id}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  return [...staticPages, ...productPages]
}
