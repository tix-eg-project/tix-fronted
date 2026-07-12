"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import { Zap, ChevronRight, ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import type { ProductCardProps } from "@/utils/Types/products";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// ─── مؤقت عد تنازلي حقيقي ───
function useCountdown(targetEndISO: string | null, serverTimeISO: string | null) {
  const [time, setTime] = useState<{ h: number; m: number; s: number }>({ h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    if (!targetEndISO) return;

    // لو فيه serverTime، احسب فرق التوقيت
    if (serverTimeISO) {
      offsetRef.current = new Date(serverTimeISO).getTime() - Date.now();
    }

    const endMs = new Date(targetEndISO).getTime();

    function calc() {
      const correctedNow = Date.now() + offsetRef.current;
      const remaining = endMs - correctedNow;
      const totalSec = Math.max(0, Math.floor(remaining / 1000));

      if (totalSec <= 0) {
        setTime({ h: 0, m: 0, s: 0 });
        setExpired(true);
        return;
      }

      setTime({
        h: Math.floor(totalSec / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
      });
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetEndISO, serverTimeISO]);

  return { time, expired };
}

const FALLBACK_PRODUCTS: ProductCardProps[] = [
  { id: "f1", name: "سماعات لاسلكية برو", price: 199, originalPrice: 399, image: "/pl1.jpg", discount: 50 },
  { id: "f2", name: "شاحن سريع 65W", price: 149, originalPrice: 299, image: "/pl2.jpg", discount: 50 },
  { id: "f3", name: "كيبل شحن سريع", price: 49, originalPrice: 99, image: "/pl1.jpg", discount: 50 },
  { id: "f4", name: "حامل هاتف للسيارة", price: 79, originalPrice: 159, image: "/pl2.jpg", discount: 50 },
  { id: "f5", name: "باور بانك 20000", price: 299, originalPrice: 599, image: "/pl1.jpg", discount: 50 },
  { id: "f6", name: "ماوس ألعاب لاسلكي", price: 120, originalPrice: 240, image: "/pl2.jpg", discount: 50 },
];

export default function FlashDeals() {
  const [products, setProducts] = useState<ProductCardProps[]>(FALLBACK_PRODUCTS);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    try {
      const response = await api.get("/product/discounted");
      if (response.data.status && response.data.data) {
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data.data;

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.price_after || p.price,
            originalPrice: p.price_before,
            image: p.images?.[0] || p.image || "/pl1.jpg",
            discount: p.discount || 0,
            rating: p.reviews?.average_rating || 0,
            reviewsCount: p.reviews?.count || 0,
          }));
          setProducts(mapped);

          // ── استخدم endTime لو الخادم بيرجعه ──
          // لو كل عرض له endTime، استخدم أقرب واحد
          const endTimes = data
            .map((p: any) => p.end_time || p.endTime || p.expires_at)
            .filter(Boolean);
          if (endTimes.length > 0) {
            const nearestEnd = endTimes.reduce((min: string, t: string) =>
              new Date(t) < new Date(min) ? t : min
            );
            setEndTime(nearestEnd);
          } else {
            // ── Fallback: العد حتى منتصف الليل ──
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            setEndTime(midnight.toISOString());
          }

          // ── استخدم serverTime لو الخادم بيرجعه ──
          if (response.data.serverTime) {
            setServerTime(response.data.serverTime);
          }
          return;
        }
      }
    } catch {
      // ابقَ على البيانات الاحتياطية
    }

    // Fallback: عد حتى منتصف الليل
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    setEndTime(midnight.toISOString());
  }, []);

  useEffect(() => {
    fetchDeals();
    // ── تحديث كل 30 ثانية ──
    const pollId = setInterval(fetchDeals, 30000);
    return () => clearInterval(pollId);
  }, [fetchDeals]);

  const { time: countdown, expired } = useCountdown(endTime, serverTime);
  const pad = (n: number) => n.toString().padStart(2, "0");

  // ── القسم دايمًا ظاهر ما لم ينتهي العرض فعليًا ──
  if (expired && products.length === 0) return null;

  return (
    <section
      className="mx-3 sm:mx-5 md:mx-8 mt-3 sm:mt-4 rounded-xl sm:rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)" }}
    >
      <div className="px-3 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6">
        {/* Header + Timer */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/15 p-1.5 sm:p-2 rounded-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                عروض الفلاش
              </h2>
              <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 hidden sm:block">
                خصومات حتى 70%
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-black/20 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5">
            {[countdown.h, countdown.m, countdown.s].map((val, i) => (
              <span key={i} className="flex items-center gap-0.5 sm:gap-1">
                <span
                  className="bg-white text-red-700 font-bold font-mono text-xs sm:text-sm w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded"
                  suppressHydrationWarning
                >
                  {pad(val)}
                </span>
                {i < 2 && <span className="text-white/80 font-bold text-[10px] sm:text-xs">:</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Products Swiper */}
        <div className="relative">
          <Swiper
            dir="rtl"
            modules={[Navigation, Autoplay]}
            spaceBetween={10}
            slidesPerView={2}
            loop={products.length > 4}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{ nextEl: ".flash-next", prevEl: ".flash-prev" }}
            breakpoints={{
              0: { slidesPerView: 2, spaceBetween: 8 },
              480: { slidesPerView: 2.5, spaceBetween: 10 },
              640: { slidesPerView: 3, spaceBetween: 12 },
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

          <button
            className="flash-prev absolute -right-1 sm:right-0 md:-right-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 text-black p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white hidden sm:flex items-center justify-center"
            aria-label="السابق"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            className="flash-next absolute -left-1 sm:left-0 md:-left-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 text-black p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white hidden sm:flex items-center justify-center"
            aria-label="التالي"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
