"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface Banner {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
}

export default function HeroBanner() {
  const { t, lang } = useLanguage();

  const defaultBanners: Banner[] = useMemo(
    () => [
      { id: 1, title: t("home.heroBanner1Title"), subtitle: t("home.heroBanner1Subtitle") },
      { id: 2, title: t("home.heroBanner2Title"), subtitle: t("home.heroBanner2Subtitle") },
      { id: 3, title: t("home.heroBanner3Title"), subtitle: t("home.heroBanner3Subtitle") },
    ],
    [t],
  );

  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [usingDefault, setUsingDefault] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (usingDefault) setBanners(defaultBanners);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultBanners, usingDefault]);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await api.get("/banners");
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          const validBanners = data
            .filter((b: any) => b.title && b.title.trim().length > 0)
            .map((b: any) => ({
              id: b.id,
              title: b.title || "",
              subtitle: b.description || b.subtitle || "",
              image: b.image || undefined,
            }));
          if (validBanners.length > 0) {
            setBanners(validBanners);
            setUsingDefault(false);
          }
        }
      } catch {
        // Keep default banners
      }
    }
    fetchBanners();
  }, [lang]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBannerHasImage = !!banners[currentSlide]?.image;

  return (
    <section
      className="relative overflow-hidden mx-3 sm:mx-5 md:mx-8 mt-3 sm:mt-5 rounded-xl sm:rounded-2xl h-[180px] sm:h-[260px] md:h-[340px] lg:h-[400px]"
      style={{
        background: currentBannerHasImage
          ? "#000"
          : "linear-gradient(125deg, #fb923c 0%, #f97316 35%, #ea580c 65%, #c2410c 100%)",
        transition: "background 0.7s ease",
      }}
    >
      {!currentBannerHasImage && (
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />
      )}

      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className="absolute inset-0 flex items-center justify-center text-center transition-all duration-700"
          style={{
            opacity: index === currentSlide ? 1 : 0,
            transform: index === currentSlide ? "scale(1)" : "scale(1.02)",
            pointerEvents: index === currentSlide ? "auto" : "none",
          }}
        >
          {banner.image && (
            <Image
              src={banner.image}
              alt={banner.title || "banner"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 90vw"
              className="object-cover"
              priority={index === 0}
            />
          )}

          {!banner.image && (
            <div className="relative z-10 max-w-[280px] sm:max-w-[400px] md:max-w-[520px] lg:max-w-[600px] px-4 sm:px-6 md:px-8">
              {banner.title && (
                <h1 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-[56px] font-extrabold leading-tight mb-2 sm:mb-3" style={{ letterSpacing: "-1px" }}>
                  {banner.title}
                </h1>
              )}
              {banner.subtitle && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
                  {banner.subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 md:bottom-6 start-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={t("home.goToSlide", { index: index + 1 })}
              className="rounded-full transition-all duration-300"
              style={{
                height: 4,
                width: index === currentSlide ? 18 : 4,
                backgroundColor: index === currentSlide ? "#fff" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
