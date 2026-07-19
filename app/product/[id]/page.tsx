import { permanentRedirect } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

type Props = { params: Promise<{ id: string }> }

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

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (product?.slug) {
    permanentRedirect(`/product/${id}/${product.slug}`)
  }

  return <ProductDetailClient productId={id} />
}
