"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, calculateDiscount, t, generateSlug } from "@/utils/helpers";
import { toast } from "react-toastify";
import type { ProductCardProps } from "@/utils/Types/products";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HOVER_CYCLE_MS = 1400;
const FADE_MS = 900;

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  images,
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

  const gallery = images && images.length > 0 ? images : [image];
  const [hoverIndex, setHoverIndex] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHoverCycle = () => {
    if (gallery.length <= 1) return;
    hoverTimer.current = setInterval(() => {
      setHoverIndex((i) => (i + 1) % gallery.length);
    }, HOVER_CYCLE_MS);
  };

  const stopHoverCycle = () => {
    if (hoverTimer.current) {
      clearInterval(hoverTimer.current);
      hoverTimer.current = null;
    }
    setHoverIndex(0);
  };

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
    <Link href={`/product/${id}/${generateSlug(productName)}`} className="block h-full">
      <Card className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full border border-gray-200 py-0 gap-0 ${
        isFlashDeal ? "bg-white border-red-200" : ""
      }`}>
        <div
          className={`relative w-full bg-gray-50 overflow-hidden ${isFlashDeal ? "aspect-square" : "aspect-[4/5]"}`}
          onMouseEnter={startHoverCycle}
          onMouseLeave={stopHoverCycle}
        >
          {gallery.map((img, i) => (
            <Image
              key={`bg-${i}`}
              src={img || "/pl1.jpg"}
              alt=""
              aria-hidden="true"
              fill
              className="object-cover scale-125 blur-lg"
              style={{
                opacity: i === hoverIndex ? 0.25 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
              }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
          ))}
          {gallery.map((img, i) => (
            <Image
              key={`fg-${i}`}
              src={img || "/pl1.jpg"}
              alt={i === 0 ? productName : ""}
              aria-hidden={i !== 0}
              fill
              className={`object-contain ${isFlashDeal ? "scale-110" : ""}`}
              style={{
                opacity: i === hoverIndex ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
              }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
          ))}
          {gallery.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {gallery.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === hoverIndex ? "w-3 bg-white" : "w-1 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
          {discountPct > 0 && (
            <span className="absolute top-2 right-2 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded bg-red-600">
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
        <div className="flex flex-col flex-1 p-3">
          <h3 className="font-medium text-[13px] mb-1.5 line-clamp-1 leading-tight text-gray-800">{productName}</h3>
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
              <span className={`font-bold text-base sm:text-lg ${discountPct > 0 ? "text-red-600" : "text-black"}`}>{formatCurrency(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="line-through text-xs text-gray-400">{formatCurrency(originalPrice)}</span>
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
              <ShoppingCart className="w-3 h-3 me-1 text-white" />
              أضف للسلة
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
