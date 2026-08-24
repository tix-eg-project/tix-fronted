"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";
import { formatCurrency } from "@/utils/helpers";
import { Package, ChevronLeft, ChevronRight, Loader2, ShoppingBag } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-gray-100 text-gray-700",
  processing: "bg-gray-100 text-gray-700",
  shipped: "bg-gray-100 text-gray-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-500",
};

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const color = STATUS_COLORS[status] || "bg-surface-2 text-text-muted";
  const label = STATUS_COLORS[status] ? t(`account.status_${status}`) : status;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}

export default function OrdersPage() {
  const { state: authState } = useAuth();
  const { t, lang, dir } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = "/login?redirect=/account/orders";
    }
  }, [authState.isLoading, authState.isAuthenticated]);

  useEffect(() => {
    if (!authState.isAuthenticated) return;
    api.get("/orders")
      .then((res) => {
        const data = res.data?.data;
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setOrders(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authState.isAuthenticated, lang]);

  if (authState.isLoading || loading) {
    return (
      <div className="card p-6 flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card p-10 flex flex-col items-center text-center text-text-muted gap-3">
        <ShoppingBag className="w-12 h-12 text-text-faint" />
        <p className="font-medium">{t('account.noOrdersYet')}</p>
        <p className="text-sm">{t('account.startShoppingHint')}</p>
        <Link href="/products" className="btn-primary !py-2 !px-5 text-sm mt-2">
          {t('account.shopNow')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{t('account.myOrders')}</h2>
      <div className="space-y-3">
        {orders.map((order: any) => {
          const items = order.items || order.products || [];
          const firstImage = items[0]?.image || items[0]?.product?.image;
          const date = order.created_at
            ? new Date(order.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { year: "numeric", month: "short", day: "numeric" })
            : "";

          return (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow group"
            >
              {/* Icon / Image */}
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden">
                {firstImage ? (
                  <img src={firstImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-5 h-5 text-text-faint" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm">{t('account.orderHash')}{order.id}</span>
                  <StatusBadge status={order.status} t={t} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  {date && <span>{date}</span>}
                  {items.length > 0 && (
                    <span>{items.length} {t('account.items')}</span>
                  )}
                </div>
              </div>

              {/* Total + arrow */}
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="font-bold text-black text-sm whitespace-nowrap">
                  {formatCurrency(order.total || 0)}
                </span>
                {dir === 'rtl'
                  ? <ChevronLeft className="w-4 h-4 text-text-faint group-hover:text-black transition-colors" />
                  : <ChevronRight className="w-4 h-4 text-text-faint group-hover:text-black transition-colors" />}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
