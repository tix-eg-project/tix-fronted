import ProductCard from "./ProductCard";
import type { ProductCardProps } from "@/utils/Types/products";

export default function ProductGrid({ products }: { products: ProductCardProps[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-lg">لا توجد منتجات متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
