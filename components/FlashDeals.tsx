"use client";
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Zap, ChevronRight, ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import type { ProductCardProps } from "@/utils/Types/products";
import { useLanguage } from "@/context/LanguageContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// عدّاد تنازلي حسب الثواني المتبقّية للعرض الجاي من الداشبورد
function useCountdown(seconds: number | null) {
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (seconds == null) { setTime(null); return; }
    let remaining = Math.max(0, Math.floor(seconds));
    function tick() {
      setTime({
        h: Math.floor(remaining / 3600),
        m: Math.floor((remaining % 3600) / 60),
        s: remaining % 60,
      });
    }
    tick();
    const id = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      tick();
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  return time;
}

// بيرجّع كام كارت بيتشاف مرة واحدة حسب عرض الشاشة الحالي (نفس حدود الـ breakpoints بتاعة السلايدر)
function useViewportSlides() {
  const [slides, setSlides] = useState(2);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1280) setSlides(5);
      else if (w >= 1024) setSlides(4);
      else if (w >= 640) setSlides(3);
      else if (w >= 480) setSlides(2.5);
      else setSlides(2);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return slides;
}

export default function FlashDeals() {
  const { t, lang, dir } = useLanguage();
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [endSeconds, setEndSeconds] = useState<number | null>(null);
  const countdown = useCountdown(endSeconds);
  const viewportSlides = useViewportSlides();
  const fitsInRow = products.length <= Math.floor(viewportSlides);

  useEffect(() => {
    async function fetchFlash() {
      try {
        // /flash-sale بيرجّع بس العرض اللي نوعه "فلاش" من الداشبورد
        const response = await api.get("/flash-sale");
        const offer = response.data?.data;
        if (response.data?.status && offer && Array.isArray(offer.products) && offer.products.length > 0) {
          setEndSeconds(typeof offer.remaining_seconds === "number" ? offer.remaining_seconds : null);
          setProducts(
            offer.products.map((p: any) => ({
              id: String(p.id),
              name: p.name,
              price: p.price_after ?? p.price,
              originalPrice: p.price_before,
              image: p.images?.[0] || p.image || "/pl1.jpg",
              images: p.images,
              discount: p.discount || 0,
              rating: p.reviews?.average_rating || 0,
              reviewsCount: p.reviews?.count || 0,
            })),
          );
          return;
        }
      } catch {
        // لو حصل خطأ أو مفيش عرض فلاش، القسم مش هيظهر
      }
      setProducts([]);
      setEndSeconds(null);
    }
    fetchFlash();
  }, [lang]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  // مفيش عرض فلاش نشط → القسم مايظهرش خالص
  if (products.length === 0) return null;

  return (
    <section className="mx-3 sm:mx-5 md:mx-8 mt-3 sm:mt-4 rounded-xl sm:rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)" }}>
      <div className="px-3 sm:px-5 md:px-6 py-3 sm:py-4">
        {/* Header + Timer */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight flex items-center gap-1.5">
                <span>{t("home.flashDealsTitle")}</span>
                <Zap
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white"
                  style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 12px rgba(255,255,255,0.6))" }}
                />
              </h2>
              <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 hidden sm:block">{t("home.flashDealsSubtitle")}</p>
            </div>
          </div>

          {/* Timer */}
          {countdown && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-black/20 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5">
              {[countdown.h, countdown.m, countdown.s].map((val, i) => (
                <span key={i} className="flex items-center gap-0.5 sm:gap-1">
                  <span className="bg-white text-red-700 font-bold font-mono text-xs sm:text-sm w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded">
                    {pad(val)}
                  </span>
                  {i < 2 && <span className="text-white/80 font-bold text-[10px] sm:text-xs">:</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        {fitsInRow ? (
          // عدد الكروت بيتشاف كامل من غير سلايدر → بتترص في النص بمقاس زي كروت أحدث المنتجات
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {products.map((product) => (
              <div key={product.id} className="w-[calc(50%-8px)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19px)] max-w-[220px]">
                <ProductCard {...product} isFlashDeal={true} />
              </div>
            ))}
          </div>
        ) : (
        <div className="relative">
          <Swiper
            key={lang}
            dir={dir}
            modules={[Navigation, Autoplay]}
            spaceBetween={10}
            slidesPerView={2}
            loop={products.length > 4}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{
              nextEl: ".flash-next",
              prevEl: ".flash-prev",
            }}
            breakpoints={{
              0:    { slidesPerView: 2, spaceBetween: 8 },
              480:  { slidesPerView: 2.5, spaceBetween: 10 },
              640:  { slidesPerView: 3, spaceBetween: 12 },
              1024: { slidesPerView: 4, spaceBetween: 16 },
              1280: { slidesPerView: 5, spaceBetween: 16 },
            }}
            className="w-full"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <div className="py-1">
                  <ProductCard {...product} isFlashDeal={true} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="flash-prev absolute -start-1 sm:start-0 md:-start-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 text-black p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white hidden sm:flex items-center justify-center">
            {dir === "rtl" ? <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <button className="flash-next absolute -end-1 sm:end-0 md:-end-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 text-black p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white hidden sm:flex items-center justify-center">
            {dir === "rtl" ? <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
        )}
      </div>
    </section>
  );
}
