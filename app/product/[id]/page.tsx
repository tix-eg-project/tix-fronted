import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      headers: { 'Accept-Language': 'ar', Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) return { title: 'منتج - TIX' }
    const data = await res.json()
    const product = data.data
    return {
      title: `${product.name} - TIX`,
      description: (product.short_description || product.name || '').substring(0, 160),
      openGraph: {
        title: `${product.name} - TIX`,
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      },
    }
  } catch {
    return { title: 'منتج - TIX' }
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  return <ProductDetailClient productId={id} />
}
