"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductCardProps } from "@/utils/Types/products";
import { useLanguage } from "@/context/LanguageContext";

const PER_PAGE = 24;

function mapProduct(p: any): ProductCardProps {
  return {
    id: String(p.id),
    name: p.name,
    price: p.price_after ?? p.price,
    originalPrice: p.price_before,
    image: p.images?.[0] || "/pl1.jpg",
    images: p.images,
    rating: p.avg_rating ?? p.reviews?.average_rating ?? 0,
    reviewsCount: p.reviews?.count ?? p.reviews_count ?? 0,
    discount: p.discount ?? 0,
  };
}

export default function LatestProducts() {
  const { t, dir, lang } = useLanguage();
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { per_page: PER_PAGE, page: 1 } })
      .then((res) => {
        const raw: any[] = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.data ?? [];
        setProducts(raw.map(mapProduct));
        setPage(1);
        setLastPage(res.data.pagination?.last_page ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    api
      .get("/products", { params: { per_page: PER_PAGE, page: nextPage } })
      .then((res) => {
        const raw: any[] = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.data ?? [];
        setProducts((prev) => [...prev, ...raw.map(mapProduct)]);
        setPage(nextPage);
        setLastPage(res.data.pagination?.last_page ?? nextPage);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t("home.latestProducts")}</h2>
        <Link href="/products" className="text-red-600 font-bold hover:underline inline-flex items-center gap-1">
          {t("common.viewAll")}
          {dir === "rtl" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? null : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {page < lastPage && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-outline px-8 disabled:opacity-60"
              >
                {loadingMore ? t("common.loadingMore") : t("common.loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
