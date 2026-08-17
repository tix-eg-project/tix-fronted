import type { Metadata } from "next";
import Image from "next/image";
import HeroBanner from "@/components/HeroBanner";
import FlashDeals from "@/components/FlashDeals";
import OffersSection from "@/components/OffersSection";
import LatestProducts from "@/components/LatestProducts";
import ProductCard from "@/components/ProductCard";
import Features from "@/components/Features";
import Link from "next/link";
import type { CategoryNavItem } from "@/utils/Types/navigation";
import type { ProductCardProps } from "@/utils/Types/products";
import { getProductImage } from "@/utils/helpers";

export const metadata: Metadata = {
  title: "TIX - تسوق أفضل المنتجات بأفضل الأسعار",
  description: "منصة TIX للتجارة الإلكترونية في مصر - ملابس، إلكترونيات، مستحضرات تجميل",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://admin.tix-eg.com";

async function fetchCategoryProducts(
  categoryId: string | number,
  limit: number = 5,
): Promise<ProductCardProps[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?category_id=${categoryId}&limit=${limit}`, {
      next: { revalidate: 600 },
      headers: { "Accept-Language": "ar", Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = Array.isArray(data.data) ? data.data : data.data?.data || [];
    return products.map(
      (p: any): ProductCardProps => ({
        id: String(p.id),
        name: p.name,
        price: p.price_after || p.price,
        originalPrice: p.price_before,
        image: getProductImage(p),
        images: p.images,
        rating: p.reviews?.average_rating || 0,
        reviewsCount: p.reviews?.count || 0,
        discount: p.discount || 0,
      }),
    );
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<CategoryNavItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      next: { revalidate: 600 },
      headers: { "Accept-Language": "ar", Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data)
      ? data.data.map((cat: any) => ({
          id: String(cat.id),
          name: typeof cat.name === "object" ? cat.name?.ar || cat.name?.en || "" : cat.name,
          slug: String(cat.id),
          image: cat.image,
        }))
      : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const categories = await fetchCategories();

  // Fetch products for each category showcase
  const categoryShowcases = await Promise.all(
    categories.slice(0, 4).map(async (cat) => ({
      id: cat.id,
      name: cat.name,
      products: await fetchCategoryProducts(cat.id, 5),
    })),
  );

  return (
    <div className="min-h-screen bg-white">
      {/* 1) Hero */}
      <HeroBanner />

      {/* 2) Flash Deals */}
      <FlashDeals />

      {/* 3) Offers */}
      <OffersSection />

      {/* 3.5) Shop by Category — circular icons */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">تسوق حسب القسم</h2>
          <div className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 scrollbar-hide">
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
        </section>
      )}

      {/* 4) Latest Products */}
      <LatestProducts />

      {/* 5) Category Showcases */}
      {categoryShowcases
        .filter((c) => c.products.length > 0)
        .map((cat) => (
          <section
            key={cat.id}
            className="container mx-auto px-4 py-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{cat.name}</h2>
              <Link
                href={`/products?category=${cat.id}`}
                className="text-red-600 font-bold hover:underline"
              >
                عرض الكل ←
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {cat.products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        ))}

      <Features />
    </div>
  );
}
