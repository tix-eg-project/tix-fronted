'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/ProductGrid'
import { Filter, SlidersHorizontal, X } from 'lucide-react'
import api from '@/lib/api'

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('q')

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '')
  const [sortBy, setSortBy] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories')
        if (res.data.status) setCategories(Array.isArray(res.data.data) ? res.data.data : [])
      } catch {}
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        let url = '/products?limit=20'
        if (selectedCategory) url += `&category_id=${selectedCategory}`
        if (searchParam) url += `&search=${encodeURIComponent(searchParam)}`
        if (sortBy === 'price_low') url += '&sort=price&direction=asc'
        if (sortBy === 'price_high') url += '&sort=price&direction=desc'

        const res = await api.get(url)
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
    fetchProducts()
  }, [selectedCategory, sortBy, searchParam])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">
          {searchParam ? `نتائج البحث: "${searchParam}"` : 'جميع المنتجات'}
        </h1>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="md:hidden btn-ghost flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-4 h-4" />
          فلتر
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className={`md:col-span-1 ${filtersOpen ? 'block' : 'hidden md:block'}`}>
          <div className="card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                الفلاتر
              </h3>
              {filtersOpen && (
                <button onClick={() => setFiltersOpen(false)} className="md:hidden">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">الأقسام</p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-right px-3 py-2 text-sm rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-primary-light text-primary' : 'hover:bg-surface-2'
                  }`}
                >
                  الكل
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(String(cat.id))}
                    className={`w-full text-right px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === String(cat.id) ? 'bg-primary-light text-primary' : 'hover:bg-surface-2'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-sm font-medium mb-2">الترتيب</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field !py-2 text-sm"
              >
                <option value="newest">الأحدث</option>
                <option value="price_low">السعر: من الأقل</option>
                <option value="price_high">السعر: من الأعلى</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-72 rounded-xl" />)}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10"><div className="skeleton h-96 rounded-xl" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}
