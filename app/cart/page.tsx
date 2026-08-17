"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Tag, Package, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, generateSlug, t } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartSummary } from "@/utils/Types/common";

export default function CartPage() {
  const { state, removeFromCart, updateQuantity, refreshCart } = useCart();
  const { state: authState } = useAuth();
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = "/login?redirect=/cart";
    }
  }, [authState.isLoading, authState.isAuthenticated]);

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const res = await api.get("/summary");
      if (res.data.status && res.data.data) {
        setSummary(res.data.data);
      }
    } catch {
      // Silent
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshCart();
      fetchSummary();
    }
  }, [authState.isAuthenticated]);

  const handleRemove = async (id: number | string) => {
    await removeFromCart(id);
    toast.success("تم الحذف من السلة");
    fetchSummary();
  };

  const handleUpdateQty = async (id: number | string, newQty: number) => {
    await updateQuantity(id, newQty);
    fetchSummary();
  };

  const handleApplyCode = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setIsApplying(true);
    setCouponError("");
    try {
      // جرب ككوبون خصم الأول
      const formData = new FormData();
      formData.append("coupon", code.toUpperCase());
      const res = await api.post("/summary", formData);
      if (res.data.status || res.data.success) {
        setSummary(res.data.data);
        toast.success(res.data.message || "تم تطبيق الكوبون");
        setIsApplying(false);
        return;
      }
    } catch {
      // الكوبون فشل — نجرب ككود مخفي
    }
    try {
      const res = await api.post("/hidden-code/redeem", { code });
      if (res.data.status) {
        setCouponCode("");
        await refreshCart();
        await fetchSummary();
        toast.success(res.data.message || "تم تفعيل الكود وإضافة المنتجات لسلتك");
        setIsApplying(false);
        return;
      }
    } catch {
      // الكود المخفي فشل برضو
    }
    setCouponError("كود غير صالح");
    setIsApplying(false);
  };

  const handleRemoveCoupon = async () => {
    if (!summary?.coupon?.code) return;
    setIsApplying(true);
    try {
      const res = await api.delete("/coupon", { data: { coupon: summary.coupon.code } });
      if (res.data.status || res.data.success) {
        setCouponCode("");
        fetchSummary();
        toast.success("تم حذف الكوبون");
      }
    } catch {
      toast.error("خطأ في حذف الكوبون");
    } finally {
      setIsApplying(false);
    }
  };

  if (authState.isLoading || state.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin w-8 h-8 border-3 border-black border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-black" />
          سلتك ({state.items.length} منتج)
        </h1>

        <AnimatePresence mode="wait">
          {state.items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">سلتك فارغة</h2>
              <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات لسلتك بعد</p>
              <Link href="/">
                <Button className="bg-black hover:bg-gray-800 text-white px-8 h-11 rounded-lg">
                  استكشف المتجر
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {state.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md"
                  >
                    <Link href={`/product/${item.productId}/${generateSlug(t(item.name))}`} className="flex-shrink-0">
                      <Image
                        src={item.image || "/pl1.jpg"}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="w-24 h-24 object-cover rounded-lg bg-gray-50"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${item.productId}/${generateSlug(t(item.name))}`}>
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm sm:text-base">
                            {item.name}
                          </h3>
                        </Link>
                        {item.selections && item.selections.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.selections.map((s, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                              >
                                {s.variant}: {s.value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-sm font-bold ${item.originalPrice && item.originalPrice > item.price ? "text-red-600" : "text-gray-900"}`}>
                            {formatCurrency(item.price)}
                          </p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatCurrency(item.originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center self-center">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1"
                        aria-label="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24 space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">ملخص الطلب</h2>

                  {/* Pricing Details */}
                  {summary && (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">السعر الفرعي</span>
                        <span className="font-bold text-gray-900">{formatCurrency(summary.subtotal)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">التوصيل</span>
                        <span className="font-bold text-gray-900">
                          {summary.shipping_zone?.price === 0 ? "مجاني" : formatCurrency(summary.shipping_zone?.price || 0)}
                        </span>
                      </div>

                      {summary.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>الخصم</span>
                          <span className="font-bold">-{formatCurrency(summary.discount)}</span>
                        </div>
                      )}

                      {/* Coupon / Hidden Code — خانة واحدة للاتنين */}
                      <div className="flex gap-2 pt-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="أدخل الكود"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value);
                              setCouponError("");
                            }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleApplyCode(); }}
                            className="bg-gray-50 border-gray-200 focus-visible:ring-red-600/20 focus-visible:border-red-600 pe-10"
                          />
                          <Tag className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          {summary?.coupon && (
                            <button
                              onClick={handleRemoveCoupon}
                              className="absolute start-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <Button
                          onClick={handleApplyCode}
                          disabled={isApplying || !couponCode.trim()}
                          className="bg-black text-white hover:bg-gray-800 px-6"
                        >
                          تطبيق
                        </Button>
                      </div>
                      {couponError && <p className="text-red-600 text-xs mt-1">{couponError}</p>}

                      <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-4 mt-2 text-gray-900">
                        <span>الإجمالي</span>
                        <span className="text-gray-900">{formatCurrency(summary.total)}</span>
                      </div>
                    </div>
                  )}

                  <Link href="/checkout" className="block pt-2">
                    <Button className="w-full h-11 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                      المتابعة للدفع
                      <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
