'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const defaultBanners = [
  {
    id: 1,
    image: '/pl1.jpg',
    title: 'عروض حصرية',
    subtitle: 'خصم يصل إلى 50% على جميع المنتجات',
    cta: 'تسوق الآن',
    link: '/offers',
  },
  {
    id: 2,
    image: '/pl2.jpg',
    title: 'أحدث المنتجات',
    subtitle: 'اكتشف تشكيلتنا الجديدة',
    cta: 'اكتشف المزيد',
    link: '/products',
  },
]

export default function HeroBanner({ banners = defaultBanners }: { banners?: typeof defaultBanners }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)

  return (
    <section className="relative h-[300px] sm:h-[400px] md:h-[480px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-700 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={banner.image}
              alt={banner.title || ''}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-secondary/80 via-secondary/50 to-secondary/20" />
          </div>

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="max-w-lg text-white">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
                  {banner.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-gray-200 leading-relaxed">
                  {banner.subtitle}
                </p>
                <Link
                  href={banner.link || '/'}
                  className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-xl transition-all text-base md:text-lg active:scale-[0.97]"
                >
                  {banner.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 backdrop-blur-sm p-2.5 md:p-3 rounded-full transition-all"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 backdrop-blur-sm p-2.5 md:p-3 rounded-full transition-all"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-2.5 hover:bg-white/60'
                }`}
                aria-label={`الانتقال للشريحة ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
