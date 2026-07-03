"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Store, Star, Package } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { t } from "@/utils/helpers";

function StarRating({ value }: { value: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(value || 0)));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rounded ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function VendorStorePage() {
  const params = useParams();
  const vendorId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/vendor/${vendorId}/profile`);
        if (res.data.status) {
          const data = res.data.data;
          setProfile(data.profile);
          const list: any[] = Array.isArray(data.products) ? data.products : [];
          setProducts(
            list.map((p: any) => ({
              id: String(p.id),
              name: p.name,
              price: p.price_after ?? p.price,
              originalPrice: p.price_before,
              image: p.images?.[0] || p.image || "/pl1.jpg",
              discount: p.discount || 0,
              rating: p.avg_rating || p.reviews?.average_rating || 0,
              reviewsCount: p.reviews?.count || 0,
            }))
          );
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="skeleton h-36 rounded-2xl mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const storeName = profile?.company_name || profile?.store_name || "المتجر";
  const avgRating = profile?.avg_rating || 0;
  const description = profile?.description || "";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 text-text-muted">
        <Link href="/" className="hover:text-text transition-colors">الرئيسية</Link>
        <span>/</span>
        <span className="text-text">{t(storeName)}</span>
      </nav>

      {/* Store Header */}
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {profile?.image ? (
          <img
            src={profile.image}
            alt={t(storeName)}
            className="w-16 h-16 rounded-2xl object-cover shrink-0"
          />
        ) : (
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
            <Store className="w-8 h-8 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{t(storeName)}</h1>
          {profile?.name && (
            <p className="text-text-muted text-sm mb-1">{profile.name}</p>
          )}
          {description && (
            <p className="text-text-muted text-sm mb-2">{description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating value={avgRating} />
                <span className="font-medium text-text">{Number(avgRating).toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              <span>{products.length} منتج</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <h2 className="text-lg font-bold mb-4">منتجات المتجر</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-text-muted">
          <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">لا توجد منتجات في هذا المتجر حالياً</p>
        </div>
      )}
    </div>
  );
}
