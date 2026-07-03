"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { t } from "@/utils/helpers";

export default function SubcategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subcategoryId = params.id as string;
  const subcategoryName = decodeURIComponent(searchParams.get("name") || "");
  const categoryId = searchParams.get("category") || "";
  const categoryName = decodeURIComponent(searchParams.get("categoryName") || "");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products?subcategory_id=${subcategoryId}&limit=40`);
        if (res.data.status) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || [];
          setProducts(data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.price_after ?? p.price,
            originalPrice: p.price_before,
            image: p.images?.[0] || p.image || "/pl1.jpg",
            discount: p.discount || 0,
            rating: p.avg_rating || p.reviews?.average_rating || 0,
            reviewsCount: p.reviews?.count || 0,
          })));
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [subcategoryId]);

  const displayName = subcategoryName || "الفئة الفرعية";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 text-text-muted flex-wrap">
        <Link href="/" className="hover:text-text transition-colors">الرئيسية</Link>
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
          <p className="text-text-muted text-sm mt-1">{products.length} منتج</p>
        )}
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-text-muted">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">لا توجد منتجات في هذه الفئة حالياً</p>
        </div>
      )}
    </div>
  );
}
