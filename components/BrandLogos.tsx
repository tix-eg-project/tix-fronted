'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Marquee from 'react-fast-marquee'
import api from '@/lib/api'

const fallbackBrands = [
  { id: 1, name: 'Brand 1', logo: '/logo.svg' },
  { id: 2, name: 'Brand 2', logo: '/logo.svg' },
  { id: 3, name: 'Brand 3', logo: '/logo.svg' },
  { id: 4, name: 'Brand 4', logo: '/logo.svg' },
  { id: 5, name: 'Brand 5', logo: '/logo.svg' },
  { id: 6, name: 'Brand 6', logo: '/logo.svg' },
]

export default function BrandLogos() {
  const [brands, setBrands] = useState(fallbackBrands)

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await api.get('/brands')
        if (response.data.status && Array.isArray(response.data.data)) {
          const fetched = response.data.data.map((b: any) => ({
            id: b.id,
            name: b.name,
            logo: b.logo || b.image || '/logo.svg',
          }))
          if (fetched.length > 0) setBrands(fetched)
        }
      } catch {
        // Use fallback
      }
    }
    fetchBrands()
  }, [])

  return (
    <section className="py-10 md:py-12 bg-surface-2">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-title mb-8 text-center">علامات تجارية موثوقة</h2>
        <Marquee speed={35} gradient={false} pauseOnHover direction="right">
          <div className="flex gap-10 md:gap-14 items-center px-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex-shrink-0 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={100}
                  height={50}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </Marquee>
      </div>
    </section>
  )
}
