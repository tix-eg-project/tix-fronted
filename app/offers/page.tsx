'use client'
import { useState, useEffect } from 'react'
import ProductGrid from '@/components/ProductGrid'
import { Percent } from 'lucide-react'
import api from '@/lib/api'

export default function OffersPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await api.get('/product/discounted')
        if (res.data.status) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || []
          setProducts(data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.price_after || p.price,
            originalPrice: p.price_before,
            image: p.images?.[0] || p.image || '/pl1.jpg',
            discount: p.discount || 0,
            rating: p.reviews?.average_rating || 0,
            reviewsCount: p.reviews?.count || 0,
          })))
        }
      } catch {} finally { setLoading(false) }
    }
    fetchOffers()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-error/10 p-2.5 rounded-xl">
          <Percent className="w-6 h-6 text-error" />
        </div>
        <div>
          <h1 className="section-title">العروض والخصومات</h1>
          <p className="text-text-muted text-sm">أفضل العروض والخصومات المتاحة الآن</p>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton h-72 rounded-xl" />)}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
