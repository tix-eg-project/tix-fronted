import type { Metadata } from 'next'
import ProductDetailClient from '../ProductDetailClient'
import { t } from '@/utils/helpers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tix-eg.com'

type Props = { params: Promise<{ id: string; slug: string }> }

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
    title: t(product.name),
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${t(product.name)} | TIX`,
      description,
      images: image ? [{ url: image, alt: t(product.name) }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t(product.name)} | TIX`,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  return <ProductDetailClient productId={id} />
}
