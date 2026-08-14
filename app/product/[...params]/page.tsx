import type { Metadata } from 'next'
import { permanentRedirect, notFound } from 'next/navigation'
// Note: slug redirect is handled client-side in ProductDetailClient
import ProductDetailClient from '../[id]/ProductDetailClient'
import { t, generateSlug } from '@/utils/helpers'
import slugMapJson from '@/lib/product-slug-map.json'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tix-eg.com'

type Props = { params: Promise<{ params: string[] }> }

function stripHtml(value: unknown): string {
  if (!value) return ''
  const str = typeof value === 'object'
    ? ((value as any).ar || (value as any).en || '')
    : String(value)
  return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      headers: { 'Accept-Language': 'ar', Accept: 'application/json' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data ?? null
  } catch {
    return null
  }
}

// Supported formats:
//   /product/79              → id=79, slug=null
//   /product/79/slug-name   → id=79, slug=slug-name  ✓ canonical
//   /product/slug-name/79   → old format → redirect to /product/79/slug-name
function parseParams(parts: string[]): { id: string; slug: string | null; shouldRedirect?: string } | null {
  if (parts.length === 1) {
    if (/^\d+$/.test(parts[0])) return { id: parts[0], slug: null }
    return null
  }
  if (parts.length === 2) {
    const [a, b] = parts
    if (/^\d+$/.test(a) && !/^\d+$/.test(b)) return { id: a, slug: b }           // id/slug ✓ canonical
    if (/^\d+$/.test(b) && !/^\d+$/.test(a)) return { id: b, slug: a, shouldRedirect: `/product/${b}/${a}` } // slug/id → redirect
  }
  return null
}

export const revalidate = 3600

export async function generateStaticParams() {
  return Object.entries(slugMapJson as Record<string, string>).map(([id, slug]) => ({
    params: [id, slug],
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { params: parts } = await params
  const parsed = parseParams(parts)
  if (!parsed) return { title: 'منتج - TIX' }

  const product = await getProduct(parsed.id)
  if (!product) return { title: 'منتج - TIX' }

  const name = t(product.meta_title) || t(product.name)
  const description = (
    t(product.meta_description) ||
    stripHtml(product.short_description || product.long_description || product.name || '')
  ).substring(0, 160)

  const slug = generateSlug(t(product.name)) || parsed.slug || ''
  const url = slug
    ? `${SITE_URL}/product/${parsed.id}/${slug}`
    : `${SITE_URL}/product/${parsed.id}`

  const keywords: string[] | undefined = Array.isArray(product.keywords)
    ? product.keywords
    : typeof product.keywords === 'string' && product.keywords.trim()
      ? product.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : undefined

  return {
    title: `${name} | TIX`,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website', url,
      title: `${name} | TIX`,
      description,
      images: product.images?.[0] ? [{ url: product.images[0], alt: name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | TIX`,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { params: parts } = await params
  const parsed = parseParams(parts)
  if (!parsed) notFound()

  // /product/old-slug/79 → /product/79/new-slug
  if (parsed.shouldRedirect) {
    permanentRedirect(parsed.shouldRedirect)
  }

  return <ProductDetailClient productId={parsed.id} />
}
