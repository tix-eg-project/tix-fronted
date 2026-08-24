"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { CategoryNavItem } from "@/utils/Types/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t as tApi } from "@/utils/helpers";

export default function CategoryBar() {
  const { t, lang, dir } = useLanguage();

  const fallbackCategories: CategoryNavItem[] = useMemo(
    () => [
      { id: "1", name: t("home.categoryElectronics"), slug: "electronics" },
      { id: "2", name: t("home.categoryFashion"), slug: "fashion" },
      { id: "3", name: t("home.categoryHomeKitchen"), slug: "home-kitchen" },
      { id: "4", name: t("home.categoryBooks"), slug: "books" },
      { id: "5", name: t("home.categoryToys"), slug: "toys" },
      { id: "6", name: t("home.categorySports"), slug: "sports" },
      { id: "7", name: t("home.categoryBeauty"), slug: "beauty" },
      { id: "8", name: t("home.categoryBaby"), slug: "baby" },
      { id: "9", name: t("home.categoryFurniture"), slug: "furniture" },
      { id: "10", name: t("home.categoryGrocery"), slug: "grocery" },
      { id: "11", name: t("home.categoryAutomotive"), slug: "automotive" },
      { id: "12", name: t("home.categoryGarden"), slug: "garden" },
    ],
    [t],
  );

  const [categories, setCategories] = useState<CategoryNavItem[]>(fallbackCategories);
  const [usingFallback, setUsingFallback] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [fitsInRow, setFitsInRow] = useState(true);

  // Keep the fallback list translated if the API call hasn't returned real categories yet
  useEffect(() => {
    if (usingFallback) setCategories(fallbackCategories);
  }, [fallbackCategories, usingFallback]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/categories");
        if (response.data.status && Array.isArray(response.data.data)) {
          const fetched: CategoryNavItem[] = response.data.data.map((cat: any) => ({
            id: String(cat.id),
            name: tApi(cat.name, lang),
            slug: cat.id,
          }));
          if (fetched.length > 0) {
            setCategories(fetched);
            setUsingFallback(false);
          }
        }
      } catch {
        // Use fallback
      }
    }
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

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
    const el = scrollRef.current;
    if (!el) return;
    const isRtl = getComputedStyle(el).direction === "rtl";
    const step = el.clientWidth * 0.9;
    const delta = direction === "next" ? step : -step;
    el.scrollBy({
      left: isRtl ? -delta : delta,
      behavior: "smooth",
    });
  };

  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 relative">
        {canScrollPrev && (
          <button
            type="button"
            onClick={() => scrollCategories("prev")}
            aria-label={t("home.scrollPrev")}
            className="hidden lg:flex items-center justify-center absolute -start-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black transition-colors"
          >
            <PrevIcon className="w-4 h-4" />
          </button>
        )}
        {canScrollNext && (
          <button
            type="button"
            onClick={() => scrollCategories("next")}
            aria-label={t("home.scrollNext")}
            className="hidden lg:flex items-center justify-center absolute -end-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black transition-colors"
          >
            <NextIcon className="w-4 h-4" />
          </button>
        )}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={`flex items-center gap-5 overflow-x-auto py-3 scrollbar-hide ${fitsInRow ? "justify-center" : ""}`}
        >
          <Link
            href="/offers"
            className="relative text-sm font-bold whitespace-nowrap text-error pb-1 transition-colors after:content-[''] after:absolute after:start-0 after:bottom-0 after:h-0.5 after:w-full after:bg-error"
          >
            {t("home.ourOffers")}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug || category.id}`}
              className="relative text-sm font-medium whitespace-nowrap text-gray-600 hover:text-black focus-visible:text-black active:text-black transition-colors pb-1 after:content-[''] after:absolute after:start-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-black after:transition-all after:duration-300 after:ease-out hover:after:w-full"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
