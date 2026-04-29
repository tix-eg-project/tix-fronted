'use client'
import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { Clock, Zap } from 'lucide-react'
import api from '@/lib/api'

export default function FlashDeals() {
  const [products, setProducts] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 })

  // Fetch discounted products
  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await api.get('/product/discounted')
        if (response.data.status && response.data.data) {
          const data = Array.isArray(response.data.data) ? response.data.data : response.data.data.data
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data.slice(0, 4).map((p: any) => ({
              id: String(p.id),
              name: p.name,
              price: p.price_after || p.price,
              originalPrice: p.price_before,
              image: p.images?.[0] || p.image || '/pl1.jpg',
              discount: p.discount || 0,
              rating: p.reviews?.average_rating || 0,
              reviewsCount: p.reviews?.count || 0,
            })))
            return
          }
        }
      } catch {
        // Use defaults below
      }
      // Fallback mock data
      setProducts([
        { id: 'f1', name: 'سماعات لاسلكية برو', price: 199, originalPrice: 399, image: '/pl1.jpg', discount: 50 },
        { id: 'f2', name: 'شاحن سريع 65W', price: 149, originalPrice: 299, image: '/pl2.jpg', discount: 50 },
        { id: 'f3', name: 'كيبل شحن سريع', price: 49, originalPrice: 99, image: '/pl1.jpg', discount: 50 },
        { id: 'f4', name: 'حامل هاتف للسيارة', price: 79, originalPrice: 159, image: '/pl2.jpg', discount: 50 },
      ])
    }
    fetchDeals()
  }, [])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        if (seconds > 0) { seconds-- }
        else {
          seconds = 59
          if (minutes > 0) { minutes-- }
          else {
            minutes = 59
            if (hours > 0) { hours-- }
            else { hours = 23 }
          }
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (products.length === 0) return null

  return (
    <section className="bg-gradient-to-l from-error via-red-500 to-orange-500 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">عروض محدودة</h2>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-white/80" />
            <div className="flex gap-1.5">
              {[
                { value: pad(timeLeft.hours), label: 'ساعة' },
                { value: pad(timeLeft.minutes), label: 'دقيقة' },
                { value: pad(timeLeft.seconds), label: 'ثانية' },
              ].map((unit, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="bg-white text-error min-w-[44px] py-1.5 rounded-lg font-bold text-lg text-center shadow-sm">
                    {unit.value}
                  </div>
                  {i < 2 && <span className="text-white text-xl font-bold">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}
