"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";
import { formatCurrency, t as tApi } from "@/utils/helpers";
import { Package, ArrowRight, ArrowLeft, RotateCcw, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-gray-100 text-gray-700",
  processing: "bg-gray-100 text-gray-700",
  shipped: "bg-gray-100 text-gray-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-500",
};

const RETURN_REASON_CODES = [1, 2, 3, 4, 5] as const;

interface ReturnModalProps {
  item: any;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ReturnModal({ item, orderId, onClose, onSuccess }: ReturnModalProps) {
  const { t, lang } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [reasonCode, setReasonCode] = useState<number | "">("");
  const [reasonText, setReasonText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maxQty = item.quantity || 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reasonCode) { toast.error(t('account.selectReturnReason')); return; }
    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/returns`, {
        order_item_id: item.item_id ?? item.id,
        quantity,
        reason_code: reasonCode,
        ...(reasonText.trim() ? { reason_text: reasonText.trim() } : {}),
      });
      toast.success(t('account.returnRequestSent'));
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('account.returnRequestError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-base flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-black" />
            {t('account.returnProductRequest')}
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
            <p className="text-sm font-medium truncate">{tApi(item.name || item.product_name || item.product?.name, lang)}</p>
            <p className="text-xs text-gray-500">{t('account.requestedQuantity')}: {item.quantity}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quantity */}
          <div>
            <label className="text-sm font-medium block mb-1.5">{t('account.returnedQuantity')}</label>
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
              {t('account.returnReason')} <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {RETURN_REASON_CODES.map((code) => (
                <label key={code} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="reason"
                    value={code}
                    checked={reasonCode === code}
                    onChange={() => setReasonCode(code)}
                    className="accent-black w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{t(`account.returnReason_${code}`)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason text */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              {t('account.additionalDetails')} <span className="text-gray-400 font-normal text-xs">({t('common.optional')})</span>
            </label>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder={t('account.returnDetailsPlaceholder')}
              rows={3}
              maxLength={2000}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-black transition-colors"
            />
            <p className="text-xs text-gray-400 text-end mt-0.5">{reasonText.length}/2000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || !reasonCode}
              className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              {t('account.sendReturnRequest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { state: authState } = useAuth();
  const { t, lang, dir } = useLanguage();
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
  }, [orderId, authState.isAuthenticated, lang]);

  if (loading) return <div className="skeleton h-60 rounded-xl" />;

  if (!order) {
    return (
      <div className="card p-10 text-center">
        <p className="text-lg font-bold">{t('account.orderNotFound')}</p>
      </div>
    );
  }

  const items = order.items || order.products || [];


  return (
    <div className="space-y-4">
      <Link
        href="/account/orders"
        className="text-sm text-black hover:underline flex items-center gap-1"
      >
        {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {t('account.backToOrders')}
      </Link>

      <div className="card p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-black" />
          {t('account.orderDetails')} {t('account.orderHash')}{order.id}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-text-muted">{t('account.status')}:</span>{" "}
            {(() => {
              const color = STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600";
              const label = STATUS_COLORS[order.status] ? t(`account.status_${order.status}`) : order.status;
              return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>{label}</span>;
            })()}
          </div>
          <div>
            <span className="text-text-muted">{t('account.total')}:</span>{" "}
            <span className="font-bold text-black">{formatCurrency(order.total || 0)}</span>
          </div>
          <div>
            <span className="text-text-muted">{t('account.date')}:</span>{" "}
            <span>{new Date(order.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { year: "numeric", month: "short", day: "numeric" })}</span>
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
                    {tApi(item.name || item.product_name || item.product?.name, lang)}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-text-muted">{t('account.quantity')}: {item.quantity}</span>
                    {item.is_returnable === true && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <RotateCcw className="w-2.5 h-2.5" />
                        {t('account.returnable')}
                      </span>
                    )}
                    {item.is_returnable === false && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                        {t('account.notReturnable')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-black">
                    {formatCurrency(item.price_after || item.price || 0)}
                  </span>
                  {item.is_returnable && (
                    <button
                      onClick={() => setReturnItem(item)}
                      className="flex items-center gap-1 text-xs text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg px-2.5 py-1.5 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {t('account.return')}
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
