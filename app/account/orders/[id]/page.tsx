"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { formatCurrency } from "@/utils/helpers";
import { Package, ArrowRight, RotateCcw, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: "قيد المراجعة",  color: "bg-yellow-100 text-yellow-700" },
  confirmed:  { label: "مؤكد",          color: "bg-emerald-100 text-emerald-700" },
  processing: { label: "جاري التجهيز",  color: "bg-blue-100 text-blue-700" },
  shipped:    { label: "تم الشحن",      color: "bg-indigo-100 text-indigo-700" },
  delivered:  { label: "تم التوصيل",   color: "bg-green-100 text-green-700" },
  cancelled:  { label: "ملغي",          color: "bg-red-100 text-red-700" },
  returned:   { label: "مُرتجع",        color: "bg-gray-100 text-gray-600" },
};

const RETURN_REASONS = [
  { code: 1, label: "المنتج معيب أو تالف" },
  { code: 2, label: "لا يطابق الوصف أو الصورة" },
  { code: 3, label: "وصل منتج خاطئ" },
  { code: 4, label: "حجم أو مقاس خاطئ" },
  { code: 5, label: "تغيير الرأي" },
];

interface ReturnModalProps {
  item: any;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ReturnModal({ item, orderId, onClose, onSuccess }: ReturnModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [reasonCode, setReasonCode] = useState<number | "">("");
  const [reasonText, setReasonText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maxQty = item.quantity || 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reasonCode) { toast.error("اختر سبب الإرجاع"); return; }
    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/returns`, {
        order_item_id: item.item_id ?? item.id,
        quantity,
        reason_code: reasonCode,
        ...(reasonText.trim() ? { reason_text: reasonText.trim() } : {}),
      });
      toast.success("تم إرسال طلب الإرجاع بنجاح");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-base flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-primary" />
            طلب إرجاع منتج
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
          <Image
            src={item.image || item.product?.image || "/pl1.jpg"}
            alt=""
            width={48}
            height={48}
            className="rounded-lg object-cover w-12 h-12 bg-white border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.name || item.product_name || item.product?.name}</p>
            <p className="text-xs text-gray-500">الكمية المطلوبة: {item.quantity}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quantity */}
          <div>
            <label className="text-sm font-medium block mb-1.5">الكمية المُرجَعة</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
              >−</button>
              <span className="w-10 text-center font-bold text-base">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
              >+</button>
            </div>
          </div>

          {/* Reason code */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              سبب الإرجاع <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {RETURN_REASONS.map((r) => (
                <label key={r.code} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="reason"
                    value={r.code}
                    checked={reasonCode === r.code}
                    onChange={() => setReasonCode(r.code)}
                    className="accent-black w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason text */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              تفاصيل إضافية <span className="text-gray-400 font-normal text-xs">(اختياري)</span>
            </label>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="اكتب أي تفاصيل إضافية عن سبب الإرجاع..."
              rows={3}
              maxLength={2000}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-black transition-colors"
            />
            <p className="text-xs text-gray-400 text-left mt-0.5">{reasonText.length}/2000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !reasonCode}
              className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              إرسال طلب الإرجاع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { state: authState } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState("");
  const [returnItem, setReturnItem] = useState<any>(null);

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!orderId || !authState.isAuthenticated) return;
    async function fetchOrder() {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.status) setOrder(res.data.data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, authState.isAuthenticated]);

  if (loading) return <div className="skeleton h-60 rounded-xl" />;

  if (!order) {
    return (
      <div className="card p-10 text-center">
        <p className="text-lg font-bold">الطلب غير موجود</p>
      </div>
    );
  }

  const items = order.items || order.products || [];
  const canReturn = !["pending", "cancelled"].includes(order.status);

  return (
    <div className="space-y-4">
      <Link
        href="/account/orders"
        className="text-sm text-black hover:underline flex items-center gap-1"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للطلبات
      </Link>

      <div className="card p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-black" />
          تفاصيل الطلب #{order.id}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-text-muted">الحالة:</span>{" "}
            {(() => {
              const s = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" };
              return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>;
            })()}
          </div>
          <div>
            <span className="text-text-muted">الإجمالي:</span>{" "}
            <span className="font-bold text-black">{formatCurrency(order.total || 0)}</span>
          </div>
          <div>
            <span className="text-text-muted">التاريخ:</span>{" "}
            <span>{new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>
        </div>

        {items.length > 0 && (
          <div className="border-t border-divider pt-4 space-y-3">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <Image
                  src={item.image || item.product?.image || "/pl1.jpg"}
                  alt=""
                  width={50}
                  height={50}
                  className="rounded-lg object-cover w-12 h-12 bg-surface-2 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.name || item.product_name || item.product?.name}
                  </p>
                  <p className="text-xs text-text-muted">الكمية: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-black">
                    {formatCurrency(item.price_after || item.price || 0)}
                  </span>
                  {canReturn && (
                    <button
                      onClick={() => setReturnItem(item)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-black border border-gray-200 hover:border-black rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      إرجاع
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {returnItem && (
        <ReturnModal
          item={returnItem}
          orderId={orderId}
          onClose={() => setReturnItem(null)}
          onSuccess={() => setReturnItem(null)}
        />
      )}
    </div>
  );
}
