import type { Metadata } from 'next'
import { permanentRedirect, notFound } from 'next/navigation'
import ProductDetailClient from '../[id]/ProductDetailClient'
import { t } from '@/utils/helpers'

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { params: parts } = await params
  const parsed = parseParams(parts)
  if (!parsed) return { title: 'منتج - TIX' }

  const product = await getProduct(parsed.id)
  if (!product) return { title: 'منتج - TIX' }

  const description = stripHtml(
    product.long_description || product.short_description || product.name || ''
  ).substring(0, 160)

  const slug = product.slug || parsed.slug || ''
  const url = slug
    ? `${SITE_URL}/product/${slug}/${parsed.id}`
    : `${SITE_URL}/product/${parsed.id}`

  const keywords: string[] | undefined = Array.isArray(product.keywords)
    ? product.keywords
    : typeof product.keywords === 'string' && product.keywords.trim()
      ? product.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : undefined

  return {
    title: t(product.name),
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website', url,
      title: `${t(product.name)} | TIX`,
      description,
      images: product.images?.[0] ? [{ url: product.images[0], alt: t(product.name) }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t(product.name)} | TIX`,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
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

  const product = await getProduct(parsed.id)

  // /product/79 with no slug → middleware handles 301, this is fallback
  // /product/wrong-slug/79 → redirect to correct slug
  if (product?.slug && parsed.slug && parsed.slug !== product.slug) {
    permanentRedirect(`/product/${product.slug}/${parsed.id}`)
  }

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: t(product.name),
    description: stripHtml(product.long_description || product.short_description || ''),
    image: product.images ?? [],
    sku: String(product.id),
    brand: product.brand?.name ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug || parsed.slug || ''}/${parsed.id}`,
      priceCurrency: 'EGP',
      price: product.price_after ?? product.price_before,
      availability: (product.quantity ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.avg_rating && product.reviews?.count ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avg_rating,
        reviewCount: product.reviews.count,
      },
    } : {}),
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
              .replace(/</g, '\\u003c')
              .replace(/>/g, '\\u003e')
              .replace(/&/g, '\\u0026'),
          }}
        />
      )}
      <ProductDetailClient productId={parsed.id} />
    </>
  )
}
