"use client";
import Image from "next/image";
import Link from "next/link";
import { Award, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { t as tApi, generateSlug } from "@/utils/helpers";
import type { LoyaltyProduct } from "@/utils/Types/loyalty";

export default function LoyaltyProductCard({ id, name, images, points_price, affordable, points_short }: LoyaltyProduct) {
  const { addToCart } = useCart();
  const { state: authState } = useAuth();
  const { t, lang } = useLanguage();
  const productName = tApi(name, lang);
  const image = images?.[0] || "/pl1.jpg";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authState.isAuthenticated) {
      toast.info(t("products.loginFirstToAddToCart"));
      return;
    }
    try {
      await addToCart(id);
      toast.success(t("products.addedToCart"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Link href={`/product/${id}/${generateSlug(productName)}`} className="block h-full">
      <div className={`card overflow-hidden h-full flex flex-col ${!affordable ? "opacity-60" : ""}`}>
        <div className="relative aspect-square bg-surface-2">
          <Image src={image} alt={productName} fill className="object-contain p-2" sizes="25vw" />
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-sm font-medium line-clamp-2 mb-2 flex-1">{productName}</h3>
          <div className="flex items-center gap-1.5 mb-2.5 font-bold text-black">
            <Award className="w-4 h-4" />
            <span>{points_price} {t("loyalty.pointsUnit")}</span>
          </div>

          {affordable ? (
            <button
              onClick={handleAddToCart}
              className="w-full text-xs h-9 rounded-md bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {t("loyalty.addToCart")}
            </button>
          ) : (
            <div className="w-full text-xs h-9 rounded-md bg-surface-2 text-text-muted flex items-center justify-center">
              {t("loyalty.pointsShort", { points: points_short })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
