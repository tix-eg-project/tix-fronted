import ProductCard from './ProductCard'

type Product = {
  id: string | number
  name: string
  price: number
  originalPrice?: number
  image: string
  rating?: number
  reviewsCount?: number
  discount?: number
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-lg">لا توجد منتجات متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}
