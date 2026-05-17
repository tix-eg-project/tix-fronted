"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { formatCurrency } from "@/utils/helpers";
import { RotateCcw, Package, Clock, CheckCircle, XCircle } from "lucide-react";

interface ReturnRequest {
  id: number;
  status_label: string | null;
  reason_label: string | null;
  quantity: number;
  refunds: { subtotal: number; shipping: number; total: number };
  created_at: string;
  approved_at: string | null;
  received_at: string | null;
  refunded_at: string | null;
  order: { id: number; total: number; delivered_at: string | null };
  item: {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    price_before: number;
    price_after: number;
    ordered_quantity: number;
  } | null;
  vendor: { id: number; name: string } | null;
}

const statusIcon = (status: string | null) => {
  if (!status) return <Clock className="w-4 h-4 text-warning" />;
  const s = status.toLowerCase();
  if (s.includes("approved") || s.includes("مقبول")) return <CheckCircle className="w-4 h-4 text-success" />;
  if (s.includes("reject") || s.includes("مرفوض")) return <XCircle className="w-4 h-4 text-error" />;
  return <Clock className="w-4 h-4 text-warning" />;
};

export default function ReturnsPage() {
  const { state: authState } = useAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authState.isAuthenticated) return;
    async function fetchReturns() {
      try {
        const res = await api.get("/returns");
        const data = res.data?.data;
        const arr = Array.isArray(data) ? data : data?.data || [];
        setReturns(arr);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchReturns();
  }, [authState.isAuthenticated]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="card p-10 text-center">
        <RotateCcw className="w-14 h-14 mx-auto text-text-faint mb-4" />
        <h2 className="text-lg font-bold mb-2">لا توجد طلبات إرجاع</h2>
        <p className="text-text-muted text-sm">لم تقم بطلب إرجاع أي منتج بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <RotateCcw className="w-5 h-5 text-primary" />
        طلبات الإرجاع
      </h2>
      {returns.map((ret) => (
        <div key={ret.id} className="card p-4">
          <div className="flex items-start gap-3">
            {ret.item && (
              <Image
                src={ret.item.product_image || "/pl1.jpg"}
                alt={ret.item.product_name}
                width={60}
                height={60}
                className="rounded-lg object-cover w-14 h-14 bg-surface-2 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium truncate">
                  {ret.item?.product_name || `طلب إرجاع #${ret.id}`}
                </h3>
                <div className="flex items-center gap-1.5 text-xs">
                  {statusIcon(ret.status_label)}
                  <span className="font-medium">{ret.status_label || "قيد المراجعة"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-text-muted mt-2">
                <span>طلب #{ret.order?.id}</span>
                <span>الكمية: {ret.quantity}</span>
                {ret.reason_label && <span>السبب: {ret.reason_label}</span>}
                <span>المبلغ: {formatCurrency(ret.refunds?.total || 0)}</span>
              </div>
              <div className="text-xs text-text-faint mt-2">
                {new Date(ret.created_at).toLocaleDateString("ar-EG")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
