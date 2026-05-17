"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { formatCurrency } from "@/utils/helpers";
import { Package, ArrowRight, RotateCcw, MessageSquare, Star, Send } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "";
  const { state: authState } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnData, setReturnData] = useState({ reason: "", quantity: 1, item_id: "" });
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!orderId || !authState.isAuthenticated) return;
    async function fetchOrder() {
      try {
        const [orderRes, commentsRes] = await Promise.allSettled([
          api.get(`/orders/${orderId}`),
          api.get(`/orders/${orderId}/comments`),
        ]);
        if (orderRes.status === "fulfilled" && orderRes.value.data.status) {
          setOrder(orderRes.value.data.data);
        }
        if (commentsRes.status === "fulfilled") {
          const cData = commentsRes.value.data?.data;
          setComments(Array.isArray(cData) ? cData : cData?.data || []);
        }
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

  const handleReturnRequest = async () => {
    if (!returnData.reason.trim()) {
      toast.error("اكتب سبب الإرجاع");
      return;
    }
    setReturnLoading(true);
    try {
      const payload: any = { reason: returnData.reason, quantity: returnData.quantity };
      if (returnData.item_id) payload.order_item_id = returnData.item_id;
      const res = await api.post(`/orders/${orderId}/returns`, payload);
      if (res.data.status || res.data.success) {
        toast.success(res.data.message || "تم إرسال طلب الإرجاع");
        setShowReturnForm(false);
      } else {
        toast.error(res.data.message || "حدث خطأ");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ في إرسال الطلب");
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link
        href="/account/orders"
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للطلبات
      </Link>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            تفاصيل الطلب #{order.id}
          </h2>
          {(order.status === "delivered" || order.status === "تم التوصيل") && (
            <button
              onClick={() => setShowReturnForm(!showReturnForm)}
              className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              طلب إرجاع
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-text-muted">الحالة:</span>{" "}
            <span className="font-medium">{order.status}</span>
          </div>
          <div>
            <span className="text-text-muted">الإجمالي:</span>{" "}
            <span className="font-bold text-primary">{formatCurrency(order.total || 0)}</span>
          </div>
          <div>
            <span className="text-text-muted">التاريخ:</span>{" "}
            <span>{new Date(order.created_at).toLocaleDateString("ar-EG")}</span>
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
                  className="rounded-lg object-cover w-12 h-12 bg-surface-2"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.product_name || item.product?.name}
                  </p>
                  <p className="text-xs text-text-muted">الكمية: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(item.price || 0)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t border-divider pt-4 mt-4">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            التعليقات ({comments.length})
          </h3>

          {comments.length > 0 && (
            <div className="space-y-2 mb-4">
              {comments.map((c: any, i: number) => (
                <div key={i} className="bg-surface-2 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{c.user || "أنت"}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={`w-3 h-3 ${si < (c.rating || 0) ? "text-warning fill-warning" : "text-text-faint"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-text-muted">{c.comment}</p>
                  {c.created_at && (
                    <span className="text-[10px] text-text-faint mt-1 block">
                      {new Date(c.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setCommentRating(s)}>
                    <Star className={`w-4 h-4 ${s <= commentRating ? "text-warning fill-warning" : "text-text-faint"}`} />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تعليقك..."
                  className="input-field !py-2 text-sm flex-1"
                />
                <button
                  onClick={async () => {
                    if (!newComment.trim()) return;
                    setCommentLoading(true);
                    try {
                      const res = await api.post("/comments", {
                        order_id: orderId,
                        comment: newComment,
                        rating: commentRating,
                      });
                      if (res.data.status || res.data.success) {
                        toast.success("تم إضافة التعليق");
                        setComments((prev) => [...prev, { user: "أنت", comment: newComment, rating: commentRating, created_at: new Date().toISOString() }]);
                        setNewComment("");
                      }
                    } catch (error: any) {
                      toast.error(error.response?.data?.message || "خطأ");
                    } finally {
                      setCommentLoading(false);
                    }
                  }}
                  disabled={commentLoading || !newComment.trim()}
                  className="btn-primary !py-2 !px-3"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Return Form */}
        {showReturnForm && (
          <div className="border-t border-divider pt-4 mt-4 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-primary" />
              طلب إرجاع
            </h3>
            {items.length > 0 && (
              <div>
                <label className="text-xs font-medium mb-1 block">المنتج</label>
                <select
                  value={returnData.item_id}
                  onChange={(e) => setReturnData((p) => ({ ...p, item_id: e.target.value }))}
                  className="input-field !py-2 text-sm"
                >
                  <option value="">كل المنتجات</option>
                  {items.map((item: any, idx: number) => (
                    <option key={idx} value={item.id}>{item.product_name || item.product?.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-medium mb-1 block">الكمية</label>
              <input
                type="number"
                min={1}
                value={returnData.quantity}
                onChange={(e) => setReturnData((p) => ({ ...p, quantity: Number(e.target.value) }))}
                className="input-field !py-2 text-sm w-24"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">سبب الإرجاع *</label>
              <textarea
                value={returnData.reason}
                onChange={(e) => setReturnData((p) => ({ ...p, reason: e.target.value }))}
                className="input-field !py-2 text-sm"
                rows={3}
                placeholder="اشرح سبب الإرجاع..."
              />
            </div>
            <button
              onClick={handleReturnRequest}
              disabled={returnLoading}
              className="btn-primary !py-2.5 text-sm"
            >
              {returnLoading ? "جاري الإرسال..." : "إرسال طلب الإرجاع"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="skeleton h-60 rounded-xl" />}>
      <OrderDetailContent />
    </Suspense>
  );
}
