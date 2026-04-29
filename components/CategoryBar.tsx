'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Smartphone, Shirt, Sparkles, Watch, ShoppingBag, Dumbbell, Gamepad2, Footprints } from 'lucide-react'
import api from '@/lib/api'

const fallbackCategories = [
  { id: '1', name: 'إلكترونيات', icon: Smartphone, slug: 'electronics' },
  { id: '2', name: 'ملابس', icon: Shirt, slug: 'clothing' },
  { id: '3', name: 'مستحضرات تجميل', icon: Sparkles, slug: 'beauty' },
  { id: '4', name: 'ساعات', icon: Watch, slug: 'watches' },
  { id: '5', name: 'حقائب', icon: ShoppingBag, slug: 'bags' },
  { id: '6', name: 'رياضة', icon: Dumbbell, slug: 'sports' },
  { id: '7', name: 'ألعاب', icon: Gamepad2, slug: 'toys' },
  { id: '8', name: 'أحذية', icon: Footprints, slug: 'shoes' },
]

const iconMap: Record<string, any> = {
  'إلكترونيات': Smartphone,
  'ملابس': Shirt,
  'مستحضرات تجميل': Sparkles,
  'ساعات': Watch,
  'حقائب': ShoppingBag,
  'رياضة': Dumbbell,
  'ألعاب': Gamepad2,
  'أحذية': Footprints,
}

export default function CategoryBar() {
  const [categories, setCategories] = useState(fallbackCategories)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get('/categories')
        if (response.data.status && Array.isArray(response.data.data)) {
          const fetched = response.data.data.map((cat: any) => ({
            id: String(cat.id),
            name: cat.name,
            slug: cat.id,
            icon: iconMap[cat.name] || ShoppingBag,
          }))
          if (fetched.length > 0) setCategories(fetched)
        }
      } catch {
        // Use fallback
      }
    }
    fetchCategories()
  }, [])

  return (
    <section className="bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-title mb-6">تسوق حسب القسم</h2>
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon || ShoppingBag
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug || category.id}`}
                className="flex-shrink-0 group text-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary-light flex items-center justify-center mb-2.5 group-hover:bg-primary group-hover:text-white text-primary transition-all duration-200 mx-auto">
                  <Icon className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <p className="text-xs md:text-sm font-medium text-text group-hover:text-primary transition-colors whitespace-nowrap">
                  {category.name}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
