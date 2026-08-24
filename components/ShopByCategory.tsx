"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CategoryNavItem } from "@/utils/Types/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function ShopByCategory({ categories }: { categories: CategoryNavItem[] }) {
  const { t, dir } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [fitsInRow, setFitsInRow] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 1) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      setFitsInRow(true);
      return;
    }
    setFitsInRow(false);
    const scrolled = Math.abs(el.scrollLeft);
    setCanScrollPrev(scrolled > 1);
    setCanScrollNext(scrolled < maxScroll - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    window.addEventListener("resize", updateScrollState);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, categories.length]);

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const isRtl = getComputedStyle(el).direction === "rtl";
    const step = el.clientWidth * 0.9;
    const delta = direction === "next" ? step : -step;
    el.scrollBy({ left: isRtl ? -delta : delta, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <section className="container mx-auto px-4 py-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">{t("home.shopByCategory")}</h2>
      <div className="relative">
        {canScrollPrev && (
          <button
            type="button"
            onClick={() => scroll("prev")}
            aria-label={t("home.scrollPrev")}
            className="hidden lg:flex absolute -start-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black transition-colors items-center justify-center"
          >
            <PrevIcon className="w-4 h-4" />
          </button>
        )}
        {canScrollNext && (
          <button
            type="button"
            onClick={() => scroll("next")}
            aria-label={t("home.scrollNext")}
            className="hidden lg:flex absolute -end-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black transition-colors items-center justify-center"
          >
            <NextIcon className="w-4 h-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={`flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 scrollbar-hide ${
            fitsInRow ? "justify-center" : ""
          }`}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug || cat.id}`}
              className="flex flex-col items-center gap-2 text-center flex-shrink-0 w-28 sm:w-40 lg:w-48"
            >
              <div className="relative w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-t-2xl overflow-hidden bg-gray-50 border border-gray-100">
                <Image
                  src={cat.image || "/pl1.jpg"}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 192px, (min-width: 640px) 160px, 112px"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium line-clamp-2">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
