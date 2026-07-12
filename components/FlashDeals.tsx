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

interface FlashDealItem extends ProductCardProps {
  endTime: string;   // ISO string من الخادم
  startTime: string;
  maxQuantity: number | null;
  soldQuantity: number;
}

// ─── مؤقت متزامن مع الخادم ───
function useServerSyncedCountdown(endTimeISO: string | null, serverTimeISO: string | null) {
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null);
  const [expired, setExpired] = useState(false);
  const offsetRef = useRef<number>(0); // الفارق بين ساعة الخادم والعميل

  useEffect(() => {
    if (!endTimeISO || !serverTimeISO) return;

    // حساب فرق التوقيت مرة واحدة: serverNow = clientNow + offset
    const serverTime = new Date(serverTimeISO).getTime();
    const clientTime = Date.now();
    offsetRef.current = serverTime - clientTime;

    const endMs = new Date(endTimeISO).getTime();

    function calc() {
      // استخدام الوقت المصحح بمقدار offset
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
  }, [endTimeISO, serverTimeISO]);

  return { time, expired };
}

// ─── جلب البيانات مع Polling كل 30 ثانية ───
function useFlashDeals() {
  const [products, setProducts] = useState<FlashDealItem[]>([]);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  const fetchDeals = useCallback(async () => {
    try {
      const response = await api.get("/flash-deals");
      if (response.data.status && response.data.data) {
        const serverTimeISO = response.data.serverTime;
        setServerTime(serverTimeISO);

        const deals = response.data.data;
        if (Array.isArray(deals) && deals.length > 0) {
          // أقرب وقت انتهاء بين كل العروض = المؤقت الرئيسي
          const nearestEnd = deals.reduce((earliest: string, deal: FlashDealItem) =>
            new Date(deal.endTime) < new Date(earliest) ? deal.endTime : earliest
          , deals[0].endTime);

          setProducts(
            deals.map((deal: any) => ({
              id: String(deal.id),
              name: deal.name,
              price: deal.price,
              originalPrice: deal.originalPrice,
              image: deal.image || "/pl1.jpg",
              discount: deal.discount || 0,
              rating: deal.rating || 0,
              reviewsCount: deal.reviewsCount || 0,
              endTime: deal.endTime,
              startTime: deal.startTime,
              maxQuantity: deal.maxQuantity,
              soldQuantity: deal.soldQuantity || 0,
            }))
          );
          return { nearestEnd, serverTimeISO };
        }
      }
    } catch (err) {
      console.error("Failed to fetch flash deals:", err);
    }
    setProducts([]); // لا بيانات وهمية — صفيف فارغ
    return { nearestEnd: null, serverTimeISO: null };
  }, []);

  useEffect(() => {
    let nearestEndRef: string | null = null;
    let serverTimeRef: string | null = null;

    async function init() {
      const result = await fetchDeals();
      nearestEndRef = result.nearestEnd;
      serverTimeRef = result.serverTimeISO;
      setLoading(false);
    }
    init();

    // Polling كل 30 ثانية للتحديث الفوري عند إضافة/حذف عروض من الداش بورد
    const pollId = setInterval(fetchDeals, 30000);

    return () => clearInterval(pollId);
  }, [fetchDeals]);

  return { products, serverTime, loading };
}

export default function FlashDeals() {
  const { products, serverTime, loading } = useFlashDeals();

  // المؤقت يستخدم أقرب وقت انتهاء
  const nearestEndTime = products.length > 0
    ? products.reduce((min, p) =>
        new Date(p.endTime) < new Date(min.endTime) ? p : min
      ).endTime
    : null;

  const { time: countdown, expired } = useServerSyncedCountdown(nearestEndTime, serverTime);

  const pad = (n: number) => n.toString().padStart(2, "0");

  // إذا انتهى العرض أو لا توجد منتجات — لا تعرض القسم
  if (loading || products.length === 0 || expired) return null;

  return (
    <section
      className="mx-3 sm:mx-5 md:mx-8 mt-3 sm:mt-4 rounded-xl sm:rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)" }}
    >
      <div className="px-3 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6">
        {/* العنوان + المؤقت */}
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

          {countdown && (
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
          )}
        </div>

        {/* منتجات Swiper */}
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
