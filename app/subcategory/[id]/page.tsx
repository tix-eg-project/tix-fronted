"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { t as tApi } from "@/utils/helpers";
import { useLanguage } from "@/context/LanguageContext";

const PER_PAGE = 40;

export default function SubcategoryPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const subcategoryId = params.id as string;
  const subcategoryName = decodeURIComponent(searchParams.get("name") || "");
  const categoryId = searchParams.get("category") || "";
  const categoryName = decodeURIComponent(searchParams.get("categoryName") || "");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subsubcategories, setSubsubcategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ current_page: number; last_page: number; total: number } | null>(null);

  const fetchProducts = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/products?subcategory_id=${subcategoryId}&page=${pageNum}&per_page=${PER_PAGE}`);
      if (res.data.status) {
        const container = res.data.data;
        const data = Array.isArray(container) ? container : container?.data || [];
        setProducts(data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          price: p.price_after ?? p.price,
          originalPrice: p.price_before,
          image: p.images?.[0] || p.image || "/pl1.jpg",
          images: p.images,
          discount: p.discount || 0,
          rating: p.avg_rating || p.reviews?.average_rating || 0,
          reviewsCount: p.reviews?.count || 0,
        })));
        setPagination(res.data.pagination ?? null);
      }
    } catch {}
    finally { setLoading(false); }
  }, [subcategoryId, lang]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts]);

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchProducts(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    api.get(`/subcategory/${subcategoryId}/subsubcategories`)
      .then((res) => {
        if (res.data.status) {
          const raw = res.data.data;
          setSubsubcategories(Array.isArray(raw) ? raw : raw?.data || []);
        }
      })
      .catch(() => {});
  }, [subcategoryId, lang]);

  const displayName = subcategoryName || t('subcategory.defaultSubcategoryName');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 text-text-muted flex-wrap">
        <Link href="/" className="hover:text-text transition-colors">{t('header.home')}</Link>
        <span>/</span>
        {categoryName && categoryId && (
          <>
            <Link href={`/products?category=${categoryId}`} className="hover:text-text transition-colors">
              {categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-text">{displayName}</span>
      </nav>

      {/* Header */}
      <div className="card p-6 mb-8">
        <h1 className="text-2xl font-bold">{displayName}</h1>
        {!loading && (
          <p className="text-text-muted text-sm mt-1">{pagination?.total ?? products.length} {t('subcategory.productUnit')}</p>
        )}
      </div>

      {/* Sub-subcategories */}
      {subsubcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">{t('subcategory.browseBySubbranch')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {subsubcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/subsubcategory/${sub.id}?name=${encodeURIComponent(tApi(sub.name, lang))}&subcategory=${subcategoryId}&subcategoryName=${encodeURIComponent(displayName)}&category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`}
                className="card p-3 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow"
              >
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-t-2xl overflow-hidden bg-gray-50">
                  <Image
                    src={sub.image || "/pl1.jpg"}
                    alt={tApi(sub.name, lang)}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 160px, (min-width: 640px) 144px, 112px"
                  />
                </div>
                <span className="text-sm font-medium line-clamp-2">{tApi(sub.name, lang)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>

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
                .filter((pnum) => pnum === 1 || pnum === pagination.last_page || Math.abs(pnum - page) <= 1)
                .reduce<(number | "...")[]>((acc, pnum, idx, arr) => {
                  if (idx > 0 && pnum - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(pnum);
                  return acc;
                }, [])
                .map((pnum, i) =>
                  pnum === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-text-muted">…</span>
                  ) : (
                    <button
                      key={pnum}
                      onClick={() => handlePageChange(pnum as number)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                        page === pnum
                          ? "bg-primary text-white"
                          : "border border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      {pnum}
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
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">{t('subcategory.noProductsInSubcategory')}</p>
        </div>
      )}
    </div>
  );
}
