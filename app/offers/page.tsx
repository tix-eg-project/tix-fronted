"use client";
import { useState, useEffect } from "react";
import ProductGrid from "@/components/ProductGrid";
import { BadgePercent } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import type { ProductCardProps } from "@/utils/Types/products";

export default function OffersPage() {
  const { t, lang } = useLanguage();
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await api.get("/product/discounted");
        if (res.data.status) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || [];
          setProducts(
            data.map(
              (p: any): ProductCardProps => ({
                id: String(p.id),
                name: p.name,
                price: p.price_after || p.price,
                originalPrice: p.price_before,
                image: p.images?.[0] || p.image || "/pl1.jpg",
                images: p.images,
                discount: p.discount || 0,
                rating: p.reviews?.average_rating || 0,
                reviewsCount: p.reviews?.count || 0,
              }),
            ),
          );
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, [lang]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="rounded-2xl border border-divider rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-dark to-dark-light text-white p-6 md:p-8 mb-8 overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
            <BadgePercent className="w-6 h-6 text-error" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{t('offers.heroTitle')}</h1>
            <p className="text-gray-200 mt-2 text-sm md:text-base">
              {t('offers.heroSubtitle')}
            </p>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
