"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";
import { formatCurrency } from "@/utils/helpers";
import { RotateCcw, Package, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ReturnRequest {
  id: number;
  status_label: string | null;
  status?: string;
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

function getStatusBadge(label: string | null, statusKey?: string) {
  const text = (label || statusKey || "").toLowerCase();

  // Success / Approved / Refunded
  if (
    text.includes("مقبول") ||
    text.includes("approved") ||
    text.includes("مسترد") ||
    text.includes("refunded") ||
    text.includes("received_good")
  ) {
    return {
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  // Rejected / Cancelled / Bad
  if (
    text.includes("مرفوض") ||
    text.includes("rejected") ||
    text.includes("ملغي") ||
    text.includes("cancelled") ||
    text.includes("received_bad")
  ) {
    return {
      icon: <XCircle className="w-4 h-4 text-red-600" />,
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  // Pending / Under review / Under return
  return {
    icon: <Clock className="w-4 h-4 text-amber-600" />,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

export default function ReturnsPage() {
  const { state: authState } = useAuth();
  const { t, lang } = useLanguage();
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
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="card p-10 text-center">
        <RotateCcw className="w-14 h-14 mx-auto text-text-faint mb-4 opacity-40" />
        <h2 className="text-lg font-bold mb-2">{t('account.noReturnRequests') || 'لا توجد طلبات إرجاع'}</h2>
        <p className="text-text-muted text-sm">{t('account.noReturnRequestsDesc') || 'لم تقم بطلب إرجاع أي منتج بعد.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-primary" />
          <span>{t('account.returnRequests') || 'طلبات الإرجاع'}</span>
        </h2>
        <span className="text-xs text-text-muted bg-gray-100 px-2.5 py-1 rounded-full font-medium">
          {returns.length} {t('account.items') || 'طلب'}
        </span>
      </div>

      {returns.map((ret) => {
        const badge = getStatusBadge(ret.status_label, ret.status);
        const refundTotal = ret.refunds?.total ?? 0;
        const refundSubtotal = ret.refunds?.subtotal ?? 0;
        const refundShipping = ret.refunds?.shipping ?? 0;

        return (
          <div key={ret.id} className="card p-5 border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-900">
                  {t('account.returnRequest') || 'طلب إرجاع'} #{ret.id}
                </span>
                <span className="text-text-faint">•</span>
                <span className="text-text-muted text-xs">
                  {t('account.orderHash') || 'طلب #'}{ret.order?.id}
                </span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                {badge.icon}
                <span>{ret.status_label || t('account.underReview') || 'قيد المراجعة'}</span>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4">
              {ret.item ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <Image
                    src={ret.item.product_image || "/pl1.jpg"}
                    alt={ret.item.product_name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-7 h-7 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                  {ret.item?.product_name || `طلب استرجاع المنتج`}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-text-muted mt-2">
                  <div>
                    <span className="text-gray-500">{t('account.quantity') || 'الكمية'}: </span>
                    <span className="font-medium text-gray-800">{ret.quantity}</span>
                  </div>

                  {ret.reason_label && (
                    <div>
                      <span className="text-gray-500">{t('account.reason') || 'السبب'}: </span>
                      <span className="font-medium text-gray-800">{ret.reason_label}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-500">{t('account.amount') || 'المبلغ المسترد'}: </span>
                    <span className="font-bold text-primary">{formatCurrency(refundTotal)}</span>
                    {refundShipping > 0 && (
                      <span className="text-[11px] text-gray-400 block">
                        (منتج: {formatCurrency(refundSubtotal)} + شحن: {formatCurrency(refundShipping)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span>{new Date(ret.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { dateStyle: 'medium' })}</span>
                  {ret.refunded_at && (
                    <span className="text-emerald-600 font-medium">
                      تم الاسترداد: {new Date(ret.refunded_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
