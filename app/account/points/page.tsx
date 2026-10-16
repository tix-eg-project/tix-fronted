"use client";
import { useState, useEffect } from "react";
import { Award, ArrowDownCircle, ArrowUpCircle, Loader2, Gift, Package } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLoyaltySummary } from "@/utils/useLoyaltySummary";
import LoyaltyProductCard from "@/components/LoyaltyProductCard";
import type { LoyaltyHistoryItem, LoyaltyHistoryResponse, LoyaltyProduct, LoyaltyProductsResponse } from "@/utils/Types/loyalty";

const HISTORY_PER_PAGE = 15;
const SHOP_PER_PAGE = 12;

export default function PointsPage() {
  const { state: authState } = useAuth();
  const { t, lang } = useLanguage();
  const { summary, loading: summaryLoading, error: summaryError } = useLoyaltySummary();

  // History
  const [items, setItems] = useState<LoyaltyHistoryItem[]>([]);
  const [meta, setMeta] = useState<LoyaltyHistoryResponse["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Points shop
  const [shopItems, setShopItems] = useState<LoyaltyProduct[]>([]);
  const [shopMeta, setShopMeta] = useState<LoyaltyProductsResponse["meta"] | null>(null);
  const [shopPage, setShopPage] = useState(1);
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [shopLoading, setShopLoading] = useState(true);

  useEffect(() => {
    if (!authState.isAuthenticated || !summary?.is_active) return;
    setHistoryLoading(true);
    api
      .get("/loyalty/history", { params: { page, per_page: HISTORY_PER_PAGE } })
      .then((res) => {
        if (res.data.status) {
          setItems(res.data.data.items || []);
          setMeta(res.data.data.meta || null);
        }
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [authState.isAuthenticated, summary?.is_active, page, lang]);

  useEffect(() => {
    // products_count tells us up front whether there's anything to fetch —
    // skips a request that would just come back empty.
    if (!authState.isAuthenticated || !summary?.is_active || !summary.products_count) return;
    setShopLoading(true);
    api
      .get("/loyalty/products", {
        params: { page: shopPage, per_page: SHOP_PER_PAGE, affordable_only: affordableOnly ? 1 : undefined },
      })
      .then((res) => {
        if (res.data.status) {
          setShopItems(res.data.data.items || []);
          setShopMeta(res.data.data.meta || null);
        }
      })
      .catch(() => {})
      .finally(() => setShopLoading(false));
  }, [authState.isAuthenticated, summary?.is_active, shopPage, affordableOnly, lang]);

  if (authState.isLoading || summaryLoading) {
    return (
      <div className="card p-6 flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="card p-10 flex flex-col items-center text-center text-text-muted gap-3">
        <Gift className="w-12 h-12 text-text-faint" />
        <p className="font-medium">{t("loyalty.loadError")}</p>
      </div>
    );
  }

  if (!summary || !summary.is_active) {
    return (
      <div className="card p-10 flex flex-col items-center text-center text-text-muted gap-3">
        <Gift className="w-12 h-12 text-text-faint" />
        <p className="font-medium">{t("loyalty.inactiveTitle")}</p>
        <p className="text-sm">{t("loyalty.inactiveDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{t("loyalty.pageTitle")}</h2>

      {/* Balance card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-muted">{t("loyalty.balanceLabel")}</p>
            <p className="text-2xl font-bold">
              {summary.balance} <span className="text-sm font-medium text-text-muted">{t("loyalty.pointsUnit")}</span>
            </p>
            <p className="text-xs text-text-faint mt-0.5">
              {t("loyalty.earnRateNote", { amount: summary.earn_rate_amount })}
            </p>
            {summary.max_points_per_order > 0 && (
              <p className="text-xs text-text-faint">
                {t("loyalty.maxPerOrderNote", { amount: summary.max_points_per_order })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Points shop — only renders once we know there's something to show */}
      {summary.products_count > 0 && (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-black" />
            {t("loyalty.shopTitle")}
            <span className="text-xs font-normal text-text-muted">
              {t("loyalty.shopProductCount", { count: summary.products_count })}
            </span>
          </h3>
          <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={affordableOnly}
              onChange={(e) => {
                setAffordableOnly(e.target.checked);
                setShopPage(1);
              }}
              className="w-3.5 h-3.5 accent-black"
            />
            {t("loyalty.affordableOnly")}
          </label>
        </div>

        {shopLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-black" />
          </div>
        ) : shopItems.length === 0 ? (
          <div className="flex flex-col items-center text-center text-text-muted gap-2 py-10">
            <Package className="w-10 h-10 text-text-faint" />
            <p className="font-medium">{t("loyalty.shopEmptyTitle")}</p>
            <p className="text-sm">{t("loyalty.shopEmptyDesc")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {shopItems.map((item) => (
                <LoyaltyProductCard key={item.id} {...item} />
              ))}
            </div>

            {shopMeta && shopMeta.last_page > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setShopPage((p) => p - 1)}
                  disabled={shopPage === 1}
                  className="px-4 py-2 rounded-xl border border-divider text-sm font-medium disabled:opacity-40 hover:border-black transition-colors"
                >
                  {t("common.previous")}
                </button>
                <span className="text-sm text-text-muted">
                  {shopPage} / {shopMeta.last_page}
                </span>
                <button
                  onClick={() => setShopPage((p) => p + 1)}
                  disabled={shopPage === shopMeta.last_page}
                  className="px-4 py-2 rounded-xl border border-divider text-sm font-medium disabled:opacity-40 hover:border-black transition-colors"
                >
                  {t("common.next")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* History */}
      <div className="card p-5">
        <h3 className="font-bold mb-4">{t("loyalty.historyTitle")}</h3>

        {historyLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-black" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center text-center text-text-muted gap-2 py-10">
            <Gift className="w-10 h-10 text-text-faint" />
            <p className="font-medium">{t("loyalty.emptyHistoryTitle")}</p>
            <p className="text-sm">{t("loyalty.emptyHistoryDesc")}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {items.map((item) => {
                const isIn = item.direction === "in";
                const date = new Date(item.created_at).toLocaleDateString(
                  lang === "en" ? "en-US" : "ar-EG",
                  { year: "numeric", month: "short", day: "numeric" },
                );
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-divider"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isIn ? "bg-success/10 text-success" : "bg-error/10 text-error"
                      }`}
                    >
                      {isIn ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t(`loyalty.type_${item.type}`)}</p>
                      <p className="text-xs text-text-faint">
                        {date}
                        {item.order_id ? ` · ${t("account.orderHash")}${item.order_id}` : ""}
                      </p>
                      {item.note && <p className="text-xs text-text-muted mt-0.5">{item.note}</p>}
                    </div>
                    <div className={`shrink-0 text-sm font-bold ${isIn ? "text-success" : "text-error"}`}>
                      {isIn ? "+" : "-"}
                      {item.points} <span className="text-xs font-normal text-text-faint">{t("loyalty.pointsUnit")}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {meta && meta.last_page > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-divider text-sm font-medium disabled:opacity-40 hover:border-black transition-colors"
                >
                  {t("common.previous")}
                </button>
                <span className="text-sm text-text-muted">
                  {page} / {meta.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === meta.last_page}
                  className="px-4 py-2 rounded-xl border border-divider text-sm font-medium disabled:opacity-40 hover:border-black transition-colors"
                >
                  {t("common.next")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
