"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CategoryNavItem } from "@/utils/Types/navigation";

export default function ShopByCategory({ categories }: { categories: CategoryNavItem[] }) {
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
    if (!scrollRef.current) return;
    const isRtl = getComputedStyle(scrollRef.current).direction === "rtl";
    const step = 220;
    const delta = direction === "next" ? step : -step;
    scrollRef.current.scrollBy({ left: isRtl ? -delta : delta, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">تسوق حسب القسم</h2>
      <div className="relative">
        {canScrollPrev && (
          <button
            type="button"
            onClick={() => scroll("prev")}
            aria-label="تمرير لليمين"
            className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black transition-colors items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {canScrollNext && (
          <button
            type="button"
            onClick={() => scroll("next")}
            aria-label="تمرير لليسار"
            className="hidden lg:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black transition-colors items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
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
              className="flex flex-col items-center gap-2 text-center flex-shrink-0 w-20 sm:w-28"
            >
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-t-2xl overflow-hidden bg-gray-50 border border-gray-100">
                <Image
                  src={cat.image || "/pl1.jpg"}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="112px"
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
