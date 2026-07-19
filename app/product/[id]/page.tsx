import ProductDetailClient from './ProductDetailClient'

type Props = { params: Promise<{ id: string }> }

// Middleware handles 301 redirect to /product/{id}/{slug} before this runs.
// This is a fallback for products without a slug yet.
export default async function ProductPage({ params }: Props) {
  const { id } = await params
  return <ProductDetailClient productId={id} />
}
