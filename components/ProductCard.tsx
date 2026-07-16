"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, calculateDiscount, t } from "@/utils/helpers";
import { toast } from "react-toastify";
import type { ProductCardProps } from "@/utils/Types/products";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewsCount,
  discount,
  isFlashDeal = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { state: authState } = useAuth();

  const discountPct = discount || calculateDiscount(originalPrice || 0, price);
  const wishlisted = isInWishlist(id);
  const productName = t(name);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authState.isAuthenticated) {
      toast.info("سجّل الدخول أولاً لإضافة المنتجات للسلة");
      return;
    }
    try {
      await addToCart(id);
      toast.success("تمت الإضافة للسلة");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authState.isAuthenticated) {
      toast.info("سجّل الدخول أولاً");
      return;
    }
    try {
      await toggleWishlist(id);
    } catch {
      toast.error("حدث خطأ");
    }
  };

  return (
    <Link href={`/product/${id}`} className="block h-full">
      <Card className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full border border-gray-200 py-0 gap-0 ${
        isFlashDeal ? "bg-white border-red-200" : ""
      }`}>
        <div className="relative h-40 w-full bg-gray-50">
          <Image
            src={image || "/pl1.jpg"}
            alt={productName}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          />
          {discountPct > 0 && (
            <span className={`absolute top-2 right-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ${
              isFlashDeal ? "bg-red-600" : "bg-red-600"
            }`}>
              {discountPct}%
            </span>
          )}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 left-2 p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10 shadow-sm"
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-red-600 text-red-600" : "text-red-600"}`} />
          </button>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className={`font-medium text-[13px] mb-1.5 line-clamp-1 leading-tight ${
            isFlashDeal ? "text-black" : "text-gray-800"
          }`}>{productName}</h3>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 ms-0.5">({reviewsCount ?? 0})</span>
          </div>
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`font-bold text-sm ${isFlashDeal ? "text-black" : "text-red-600"}`}>{formatCurrency(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className={`line-through text-[10px] ${isFlashDeal ? "text-gray-400" : "text-gray-400"}`}>{formatCurrency(originalPrice)}</span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              className={`w-full text-[11px] h-8 rounded-md transition-colors ${
                isFlashDeal
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-black hover:bg-gray-800 text-white"
              }`}
            >
              <ShoppingCart className={`w-3 h-3 me-1 ${isFlashDeal ? "text-white" : "text-white"}`} />
              أضف للسلة
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
