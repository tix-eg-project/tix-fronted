"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tag, Clock, ShoppingBag } from "lucide-react";
import api from "@/lib/api";
import { t as tApi } from "@/utils/helpers";
import { useLanguage } from "@/context/LanguageContext";
import ProductCard from "@/components/ProductCard";

function getRemainingDays(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function OfferProductsPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const offerId = params.id as string;
  const offerName = decodeURIComponent(searchParams.get("name") || t('offers.defaultOfferName'));

  const [offer, setOffer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/offers/${offerId}/products`);
        if (res.data.status) {
          if (res.data.offer) setOffer(res.data.offer);
          // Handle all possible structures
          const raw = res.data.data ?? res.data.products ?? res.data.items ?? [];
          const list = Array.isArray(raw) ? raw : raw?.data || raw?.products || [];
          setProducts(
            list.map((p: any) => ({
              id: String(p.id),
              name: p.name,
              price: p.price_after ?? p.price,
              originalPrice: p.price_before,
              image: p.images?.[0] || p.image || "/pl1.jpg",
              images: p.images,
              discount: p.discount || 0,
              rating: p.avg_rating || p.reviews?.average_rating || 0,
              reviewsCount: p.reviews?.count || 0,
            }))
          );
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, [offerId, lang]);

  const displayName = tApi(offer?.name, lang) || offerName;
  const days = offer?.end_date ? getRemainingDays(offer.end_date) : null;
  const expired = days !== null && days <= 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-red-700 via-red-600 to-orange-500">
        {offer?.image_url && (
          <img
            src={offer.image_url}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative container mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">{t('offers.home')}</Link>
            <span>/</span>
            <Link href="/offers" className="hover:text-white transition-colors">{t('offers.offers')}</Link>
            <span>/</span>
            <span className="text-white">{displayName}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Tag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {days !== null && !expired && (
                  <span className="flex items-center gap-1.5 text-white/90 text-sm">
                    <Clock className="w-4 h-4" />
                    {days === 0 ? t('offers.endsToday') : days === 1 ? t('offers.oneDayLeft') : t('offers.daysLeft', { days })}
                  </span>
                )}
                {expired && (
                  <span className="bg-black/30 text-white text-sm px-3 py-1 rounded-full">{t('offers.offerExpired')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-text-muted text-sm mb-5">{t('offers.productsInOffer', { count: products.length })}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} {...p} offerId={offerId} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-24 text-text-muted">
            <ShoppingBag className="w-14 h-14 mx-auto mb-4 opacity-25" />
            <p className="text-xl font-semibold mb-1">{t('offers.noProductsInOffer')}</p>
            <Link href="/offers" className="text-primary hover:underline text-sm mt-2 inline-block">
              {t('offers.browseOtherOffers')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
