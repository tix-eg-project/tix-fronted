import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tix-eg.com'

type Props = { params: Promise<{ id: string }> }

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function getProduct(id: string) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    headers: { 'Accept-Language': 'ar', Accept: 'application/json' },
    next: { revalidate: 300 },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.data ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) return { title: 'منتج - TIX' }

  const description = stripHtml(
    product.long_description || product.short_description || product.name || ''
  ).substring(0, 160)

  const image = product.images?.[0]
  const url = `${SITE_URL}/product/${id}`
  const keywords: string[] | undefined = Array.isArray(product.keywords)
    ? product.keywords
    : typeof product.keywords === 'string' && product.keywords.trim() !== ''
      ? product.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : undefined

  return {
    title: `${product.name} - TIX`,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${product.name} - TIX`,
      description,
      images: image ? [{ url: image, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - TIX`,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: stripHtml(product.long_description || product.short_description || ''),
        image: product.images ?? [],
        sku: String(product.id),
        brand: product.brand?.name
          ? { '@type': 'Brand', name: product.brand.name }
          : undefined,
        ...(Array.isArray(product.keywords)
          ? { keywords: product.keywords.join(', ') }
          : typeof product.keywords === 'string' && product.keywords.trim() !== ''
            ? { keywords: product.keywords }
            : {}),
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/product/${id}`,
          priceCurrency: 'EGP',
          price: product.price_after ?? product.price_before,
          availability:
            (product.quantity ?? 0) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
        ...(product.avg_rating && product.reviews?.count
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.avg_rating,
                reviewCount: product.reviews.count,
              },
            }
          : {}),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient productId={id} />
    </>
  )
}
