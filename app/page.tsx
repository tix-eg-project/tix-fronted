import type { Metadata } from 'next'
import HeroBanner from '@/components/HeroBanner'
import CategoryBar from '@/components/CategoryBar'
import FlashDeals from '@/components/FlashDeals'
import BrandLogos from '@/components/BrandLogos'
import ProductGrid from '@/components/ProductGrid'
import { Shield, Truck, CreditCard, Headphones, RotateCcw, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TIX - تسوق أفضل المنتجات بأفضل الأسعار',
  description: 'منصة TIX للتجارة الإلكترونية في مصر - ملابس، إلكترونيات، مستحضرات تجميل',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=8`, {
      next: { revalidate: 600 },
      headers: { 'Accept-Language': 'ar', Accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = await res.json()
    const products = Array.isArray(data.data) ? data.data : data.data?.data || []
    return products.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      price: p.price_after || p.price,
      originalPrice: p.price_before,
      image: p.images?.[0] || '/pl1.jpg',
      rating: p.reviews?.average_rating || 0,
      reviewsCount: p.reviews?.count || 0,
      discount: p.discount || 0,
    }))
  } catch {
    return []
  }
}

async function fetchCategoryProducts(categoryId: number, limit: number = 4) {
  try {
    const res = await fetch(`${API_URL}/api/products?category_id=${categoryId}&limit=${limit}`, {
      next: { revalidate: 600 },
      headers: { 'Accept-Language': 'ar', Accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = await res.json()
    const products = Array.isArray(data.data) ? data.data : data.data?.data || []
    return products.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      price: p.price_after || p.price,
      originalPrice: p.price_before,
      image: p.images?.[0] || '/pl1.jpg',
      rating: p.reviews?.average_rating || 0,
      reviewsCount: p.reviews?.count || 0,
      discount: p.discount || 0,
    }))
  } catch {
    return []
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      next: { revalidate: 600 },
      headers: { 'Accept-Language': 'ar', Accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.data) ? data.data.slice(0, 3) : []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ])

  // Fetch products for each category showcase
  const categoryShowcases = await Promise.all(
    categories.map(async (cat: any) => ({
      id: cat.id,
      name: typeof cat.name === 'object' ? (cat.name?.ar || cat.name?.en || '') : cat.name,
      products: await fetchCategoryProducts(cat.id, 4),
    }))
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* 1) Hero */}
      <HeroBanner />

      {/* 2) Category Nav */}
      <CategoryBar />

      {/* 3) Flash Deals */}
      <FlashDeals />

      {/* 4) Latest Products */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <h2 className="section-title">أحدث المنتجات</h2>
          <Link href="/products" style={{ color: '#FF8C00', fontSize: 14, fontWeight: 600, transition: 'opacity 0.2s' }}>
            عرض الكل ←
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>

      {/* 5) Category Showcases — products per category */}
      {categoryShowcases.filter(c => c.products.length > 0).map((cat) => (
        <section key={cat.id} style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 40px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <h2 className="section-title">{cat.name}</h2>
            <Link href={`/products?category=${cat.id}`} style={{ color: '#FF8C00', fontSize: 14, fontWeight: 600 }}>
              عرض الكل ←
            </Link>
          </div>
          <ProductGrid products={cat.products} />
        </section>
      ))}

      {/* 6) Brand Logos */}
      <BrandLogos />

      {/* 7) Features Section — before Footer */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
        <div className="text-center" style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#212121', marginBottom: 12 }}>لماذا تتسوق من TIX؟</h2>
          <p style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto' }}>نقدم لك أفضل تجربة تسوق إلكتروني مع ضمان الجودة والأمان</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Shield, title: 'جودة مضمونة', desc: 'جميع منتجاتنا أصلية 100% ومضمونة من المصنع' },
            { icon: Truck, title: 'توصيل سريع', desc: 'توصيل لجميع أنحاء مصر خلال 2-5 أيام عمل' },
            { icon: CreditCard, title: 'دفع آمن', desc: 'طرق دفع متعددة وآمنة بتشفير كامل' },
            { icon: RotateCcw, title: 'إرجاع سهل', desc: 'إمكانية الإرجاع خلال 14 يوم من الاستلام' },
            { icon: Headphones, title: 'دعم متواصل', desc: 'فريق دعم فني متاح على مدار الساعة' },
            { icon: CheckCircle, title: 'أسعار تنافسية', desc: 'أفضل الأسعار مع عروض وخصومات مستمرة' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card p-6 text-center group cursor-default"
              style={{ borderRadius: 12 }}
            >
              <div
                className="mx-auto flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: '#F5F5F5',
                  color: '#212121',
                  marginBottom: 16,
                }}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#212121', marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
