"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { CategoryNavItem } from "@/utils/Types/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const fallbackCategories: CategoryNavItem[] = [
  { id: "1", name: "الإلكترونيات", slug: "electronics" },
  { id: "2", name: "الأزياء", slug: "fashion" },
  { id: "3", name: "المنزل والمطبخ", slug: "home-kitchen" },
  { id: "4", name: "الكتب", slug: "books" },
  { id: "5", name: "الألعاب", slug: "toys" },
  { id: "6", name: "الرياضة", slug: "sports" },
  { id: "7", name: "الجمال", slug: "beauty" },
  { id: "8", name: "الأطفال", slug: "baby" },
  { id: "9", name: "الأثاث", slug: "furniture" },
  { id: "10", name: "البقالة", slug: "grocery" },
  { id: "11", name: "السيارات", slug: "automotive" },
  { id: "12", name: "الحدائق", slug: "garden" },
];

export default function CategoryBar() {
  const [categories, setCategories] = useState<CategoryNavItem[]>(fallbackCategories);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [fitsInRow, setFitsInRow] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/categories");
        if (response.data.status && Array.isArray(response.data.data)) {
          const fetched: CategoryNavItem[] = response.data.data.map((cat: any) => ({
            id: String(cat.id),
            name: typeof cat.name === 'object' ? (cat.name.ar || cat.name.en) : cat.name,
            slug: cat.id,
          }));
          if (fetched.length > 0) setCategories(fetched);
        }
      } catch {
        // Use fallback
      }
    }
    fetchCategories();
  }, []);

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

  const scrollCategories = (direction: "next" | "prev") => {
    if (!scrollRef.current) return;
    const isRtl = getComputedStyle(scrollRef.current).direction === "rtl";
    const step = 220;
    const delta = direction === "next" ? step : -step;
    scrollRef.current.scrollBy({
      left: isRtl ? -delta : delta,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 relative">
        {canScrollPrev && (
          <button
            type="button"
            onClick={() => scrollCategories("prev")}
            aria-label="تمرير الأقسام لليمين"
            className="hidden lg:flex items-center justify-center absolute -right-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {canScrollNext && (
          <button
            type="button"
            onClick={() => scrollCategories("next")}
            aria-label="تمرير الأقسام لليسار"
            className="hidden lg:flex items-center justify-center absolute -left-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={`flex items-center gap-5 overflow-x-auto py-3 scrollbar-hide ${fitsInRow ? "justify-center" : ""}`}
        >
          <Link
            href="/offers"
            className="relative text-sm font-bold whitespace-nowrap text-error pb-1 transition-colors after:content-[''] after:absolute after:right-0 after:bottom-0 after:h-0.5 after:w-full after:bg-error"
          >
            عروضنا
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug || category.id}`}
              className="relative text-sm font-medium whitespace-nowrap text-gray-600 hover:text-black focus-visible:text-black active:text-black transition-colors pb-1 after:content-[''] after:absolute after:right-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-black after:transition-all after:duration-300 after:ease-out hover:after:w-full"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
