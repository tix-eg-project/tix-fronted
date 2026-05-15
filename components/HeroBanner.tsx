"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";

interface Banner {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
}

const defaultBanners: Banner[] = [
  { id: 1, title: "وفر وقتك", subtitle: "واطلب مستلزماتك اونلاين" },
  { id: 2, title: "أفضل الأسعار", subtitle: "خصومات تصل حتى 50% على منتجات مختارة" },
  { id: 3, title: "توصيل سريع", subtitle: "لجميع أنحاء مصر في أسرع وقت" },
];

export default function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasImages, setHasImages] = useState(false);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await api.get("/banners");
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data.map((b: any) => ({
            id: b.id,
            title: b.title || "",
            subtitle: b.description || b.subtitle || "",
            image: b.image || "",
          })));
          setHasImages(data.some((b: any) => b.image));
        }
      } catch {
        // Keep default banners
      }
    }
    fetchBanners();
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        margin: '20px 32px',
        borderRadius: 16,
        height: 380,
        background: hasImages ? '#000' : 'linear-gradient(125deg, #fb923c 0%, #f97316 35%, #ea580c 65%, #c2410c 100%)',
      }}
    >
      {/* Subtle radial overlay (only when no images) */}
      {!hasImages && (
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)' }}
        />
      )}

      {/* Content slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className="absolute inset-0 flex items-center justify-center text-center transition-all duration-700"
          style={{
            opacity: index === currentSlide ? 1 : 0,
            transform: index === currentSlide ? 'scale(1)' : 'scale(1.02)',
          }}
        >
          {/* Banner image background */}
          {banner.image && (
            <Image
              src={banner.image}
              alt={banner.title || ""}
              fill
              className="object-cover"
              priority={index === 0}
            />
          )}

          {/* Text overlay */}
          <div className="relative z-10" style={{ maxWidth: 600, padding: '0 32px' }}>
            {banner.image && (
              <div className="absolute inset-0 -m-8 bg-black/30 rounded-2xl blur-sm" />
            )}
            <div className="relative">
              {banner.title && (
                <h1
                  className="text-white"
                  style={{
                    fontSize: banner.image ? 42 : 56,
                    fontWeight: 800,
                    letterSpacing: '-2px',
                    lineHeight: 1.1,
                    marginBottom: 12,
                    textShadow: banner.image ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
                  }}
                >
                  {banner.title}
                </h1>
              )}
              {banner.subtitle && (
                <p
                  style={{
                    fontSize: banner.image ? 18 : 21,
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.92)',
                    lineHeight: 1.5,
                    textShadow: banner.image ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
                  }}
                >
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`الانتقال للشريحة ${index + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                height: 5,
                width: index === currentSlide ? 22 : 5,
                backgroundColor: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
