"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { t as tApi } from "@/utils/helpers";

interface Offer {
  id: number;
  name: string;
  image_url: string | null;
  type: string;
  amount_value: number;
  amount_type: "percentage" | "fixed";
  start_date: string;
  end_date: string;
}

function getRemainingDays(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

export default function OffersSection() {
  const { t, lang, dir } = useLanguage();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/offers")
      .then((res) => {
        if (res.data.status) {
          const raw = res.data.data;
          setOffers(Array.isArray(raw) ? raw : raw?.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton h-8 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (offers.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-7 bg-red-600 rounded-full" />
          <h2 className="text-2xl font-bold">{t("home.exclusiveOffers")}</h2>
        </div>
        <Link href="/offers" className="flex items-center gap-1 text-red-600 font-semibold text-sm hover:underline">
          {t("common.viewAll")}
          {dir === "rtl" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {offers.map((offer) => {
          const days = getRemainingDays(offer.end_date);
          const expired = days <= 0;
          const offerName = tApi(offer.name, lang);

          return (
            <Link
              key={offer.id}
              href={`/offers/${offer.id}?name=${encodeURIComponent(offerName)}`}
              className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white flex flex-col"
            >
              {/* Image / Gradient bg */}
              <div className="relative h-36 bg-gradient-to-br from-red-500 to-orange-400 overflow-hidden">
                {offer.image_url ? (
                  <img
                    src={offer.image_url}
                    alt={offerName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag className="w-12 h-12 text-white/60" />
                  </div>
                )}

                {/* Expired overlay */}
                {expired && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">
                      {t("home.offerExpired")}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 flex-1 flex flex-col gap-2">
                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
                  {offerName}
                </h3>

                {!expired && days <= 30 && (
                  <div className="flex items-center gap-1 text-xs text-orange-500 font-medium mt-auto">
                    <Clock className="w-3.5 h-3.5" />
                    {days === 0
                      ? t("home.endsToday")
                      : days === 1
                      ? t("home.oneDayLeft")
                      : t("home.daysLeft", { days })}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
