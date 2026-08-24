import type { Metadata } from "next";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import HeroBanner from "@/components/HeroBanner";
import FlashDeals from "@/components/FlashDeals";
import OffersSection from "@/components/OffersSection";
import LatestProducts from "@/components/LatestProducts";
import ProductCard from "@/components/ProductCard";
import ShopByCategory from "@/components/ShopByCategory";

// Below-the-fold section — split into its own chunk instead of the
// homepage's main bundle, since it's rendered last and not needed
// for the initial view.
const Features = dynamic(() => import("@/components/Features"));
import Link from "next/link";
import type { CategoryNavItem } from "@/utils/Types/navigation";
import type { ProductCardProps } from "@/utils/Types/products";
import { getProductImage, t as tApi } from "@/utils/helpers";

export const metadata: Metadata = {
  title: "TIX - تسوق أفضل المنتجات بأفضل الأسعار",
  description: "منصة TIX للتجارة الإلكترونية في مصر - ملابس، إلكترونيات، مستحضرات تجميل",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://admin.tix-eg.com";

async function fetchCategoryProducts(
  categoryId: string | number,
  limit: number = 5,
  lang: string = "ar",
): Promise<ProductCardProps[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?category_id=${categoryId}&limit=${limit}`, {
      cache: "no-store",
      headers: { "Accept-Language": lang, lang, Accept: "application/json" },
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

async function fetchCategories(lang: string = "ar"): Promise<CategoryNavItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      cache: "no-store",
      headers: { "Accept-Language": lang, lang, Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data)
      ? data.data.map((cat: any) => ({
          id: String(cat.id),
          name: tApi(cat.name, lang as "ar" | "en"),
          slug: String(cat.id),
          image: cat.image,
        }))
      : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "en" ? "en" : "ar";

  const categories = await fetchCategories(lang);

  // Fetch products for each category showcase
  const categoryShowcases = await Promise.all(
    categories.slice(0, 4).map(async (cat) => ({
      id: cat.id,
      name: cat.name,
      products: await fetchCategoryProducts(cat.id, 5, lang),
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
      <ShopByCategory categories={categories} />

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
                {lang === "en" ? "View all →" : "عرض الكل ←"}
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
