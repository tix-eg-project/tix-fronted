"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { formatCurrency } from "@/utils/helpers";
import { Package, ChevronLeft, Loader2, ShoppingBag } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: "قيد المراجعة",  color: "bg-yellow-100 text-yellow-700" },
  confirmed:  { label: "مؤكد",          color: "bg-emerald-100 text-emerald-700" },
  processing: { label: "جاري التجهيز",  color: "bg-blue-100 text-blue-700" },
  shipped:    { label: "تم الشحن",      color: "bg-indigo-100 text-indigo-700" },
  delivered:  { label: "تم التوصيل",   color: "bg-green-100 text-green-700" },
  cancelled:  { label: "ملغي",          color: "bg-red-100 text-red-700" },
  returned:   { label: "مُرتجع",        color: "bg-gray-100 text-gray-600" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: "bg-surface-2 text-text-muted" };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function OrdersPage() {
  const { state: authState } = useAuth();
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
  }, [authState.isAuthenticated]);

  if (authState.isLoading || loading) {
    return (
      <div className="card p-6 flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card p-10 flex flex-col items-center text-center text-text-muted gap-3">
        <ShoppingBag className="w-12 h-12 text-text-faint" />
        <p className="font-medium">لا توجد طلبات بعد</p>
        <p className="text-sm">ابدأ التسوق وستظهر طلباتك هنا</p>
        <Link href="/products" className="btn-primary !py-2 !px-5 text-sm mt-2">
          تسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">طلباتي</h2>
      <div className="space-y-3">
        {orders.map((order: any) => {
          const items = order.items || order.products || [];
          const firstImage = items[0]?.image || items[0]?.product?.image;
          const date = order.created_at
            ? new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })
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
                  <span className="font-semibold text-sm">طلب #{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  {date && <span>{date}</span>}
                  {items.length > 0 && (
                    <span>{items.length} {items.length === 1 ? "منتج" : "منتجات"}</span>
                  )}
                </div>
              </div>

              {/* Total + arrow */}
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="font-bold text-primary text-sm whitespace-nowrap">
                  {formatCurrency(order.total || 0)}
                </span>
                <ChevronLeft className="w-4 h-4 text-text-faint group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
