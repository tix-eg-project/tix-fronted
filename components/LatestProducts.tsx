"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { ProductCardProps } from "@/utils/Types/products";

export default function LatestProducts() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products", { params: { per_page: 10 } })
      .then((res) => {
        const raw: any[] = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.data ?? [];
        setProducts(
          raw.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.price_after ?? p.price,
            originalPrice: p.price_before,
            image: p.images?.[0] || "/pl1.jpg",
            images: p.images,
            rating: p.avg_rating ?? p.reviews?.average_rating ?? 0,
            reviewsCount: p.reviews?.count ?? p.reviews_count ?? 0,
            discount: p.discount ?? 0,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">أحدث المنتجات</h2>
        <Link href="/products" className="text-red-600 font-bold hover:underline">
          عرض الكل ←
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? null : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </section>
  );
}
