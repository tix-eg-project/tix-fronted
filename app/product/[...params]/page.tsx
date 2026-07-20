import type { Metadata } from 'next'
import { permanentRedirect, notFound } from 'next/navigation'
import ProductDetailClient from '../[id]/ProductDetailClient'
import { t } from '@/utils/helpers'
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
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data ?? null
  } catch {
    return null
  }
}

// Resolve {id, slug} from URL segments
// Supported formats:
//   /product/79              → id=79, slug=null
//   /product/slug-name/79   → id=79, slug=slug-name  ✓ canonical
//   /product/79/slug-name   → old format → redirect
function parseParams(parts: string[]): { id: string; slug: string | null; shouldRedirect?: string } | null {
  if (parts.length === 1) {
    if (/^\d+$/.test(parts[0])) return { id: parts[0], slug: null }
    return null
  }
  if (parts.length === 2) {
    const [a, b] = parts
    if (/^\d+$/.test(b) && !/^\d+$/.test(a)) return { id: b, slug: a }           // slug/id ✓
    if (/^\d+$/.test(a) && !/^\d+$/.test(b)) return { id: a, slug: b, shouldRedirect: `/product/${b}/${a}` } // id/slug → redirect
  }
  return null
}

export const revalidate = 3600

export async function generateStaticParams() {
  return Object.entries(slugMapJson as Record<string, string>).map(([id, slug]) => ({
    params: [slug, id],
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { params: parts } = await params
  const parsed = parseParams(parts)
  if (!parsed) return { title: 'منتج - TIX' }

  const slug = parsed.slug || ''
  const url = slug
    ? `${SITE_URL}/product/${parsed.id}/${slug}`
    : `${SITE_URL}/product/${parsed.id}`

  return {
    title: 'منتج | TIX',
    alternates: { canonical: url },
  }
}

export default async function ProductPage({ params }: Props) {
  const { params: parts } = await params
  const parsed = parseParams(parts)
  if (!parsed) notFound()

  // /product/79/old-slug → /product/new-slug/79
  if (parsed.shouldRedirect) {
    permanentRedirect(parsed.shouldRedirect)
  }

  return <ProductDetailClient productId={parsed.id} />
}
