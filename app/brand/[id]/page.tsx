"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tag } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";

const PER_PAGE = 10;

export default function BrandPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const brandId = params.id as string;
  const brandName = decodeURIComponent(searchParams.get("name") || "");

  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (p: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/brands/${brandId}/products?page=${p}&per_page=${PER_PAGE}`);
      if (res.data.status) {
        const list: any[] = Array.isArray(res.data.data) ? res.data.data : [];
        setProducts(
          list.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            price: item.price_after ?? item.price,
            originalPrice: item.price_before,
            image: item.images?.[0] || "/pl1.jpg",
            images: item.images,
            discount: item.discount || 0,
            rating: item.avg_rating || 0,
            reviewsCount: item.reviews_count || 0,
          }))
        );
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [brandId, lang]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [brandId, lang]);

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchProducts(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayName = brandName || t('brand.defaultBrandName');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 text-text-muted">
        <Link href="/" className="hover:text-text transition-colors">{t('header.home')}</Link>
        <span>/</span>
        <span className="text-text">{displayName}</span>
      </nav>

      {/* Brand Header */}
      <div className="card p-6 mb-8 flex items-center gap-4">
        <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
          <Tag className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {pagination && (
            <p className="text-text-muted text-sm mt-0.5">{pagination.total} {t('brand.productUnit')}</p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: PER_PAGE }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                {t('common.previous')}
              </button>

              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-text-muted">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-primary text-white"
                          : "border border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.last_page}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-text-muted">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">{t('brand.noProductsForBrand')}</p>
        </div>
      )}
    </div>
  );
}
