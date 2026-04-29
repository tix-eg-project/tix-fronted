'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Tag, Package, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import api from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/utils'
import type { CartSummary } from '@/lib/types'

export default function CartPage() {
  const { state, removeFromCart, updateQuantity, refreshCart } = useCart()
  const { state: authState } = useAuth()
  const [summary, setSummary] = useState<CartSummary | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = '/login?redirect=/cart'
    }
  }, [authState.isLoading, authState.isAuthenticated])

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const res = await api.get('/summary')
      if (res.data.status && res.data.data) {
        setSummary(res.data.data)
      }
    } catch {
      // Silent
    }
  }

  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshCart()
      fetchSummary()
    }
  }, [authState.isAuthenticated])

  const handleRemove = async (id: number | string) => {
    await removeFromCart(id)
    toast.success('تم الحذف من السلة')
    fetchSummary()
  }

  const handleUpdateQty = async (id: number | string, newQty: number) => {
    await updateQuantity(id, newQty)
    fetchSummary()
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsApplying(true)
    setCouponError('')
    try {
      const formData = new FormData()
      formData.append('coupon', couponCode.trim().toUpperCase())
      const res = await api.post('/summary', formData)
      if (res.data.status || res.data.success) {
        setSummary(res.data.data)
        toast.success(res.data.message || 'تم تطبيق الكوبون')
      } else {
        setCouponError(res.data.message || 'كوبون غير صالح')
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'حدث خطأ')
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemoveCoupon = async () => {
    if (!summary?.coupon?.code) return
    setIsApplying(true)
    try {
      const res = await api.delete('/coupon', { data: { coupon: summary.coupon.code } })
      if (res.data.status || res.data.success) {
        setCouponCode('')
        fetchSummary()
        toast.success('تم حذف الكوبون')
      }
    } catch {
      toast.error('خطأ في حذف الكوبون')
    } finally {
      setIsApplying(false)
    }
  }

  if (authState.isLoading || state.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          سلة المشتريات
          {state.items.length > 0 && (
            <span className="badge-primary text-xs">{state.items.length}</span>
          )}
        </h1>
        {state.items.length > 0 && (
          <Link
            href="/checkout"
            className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2"
          >
            إتمام الشراء
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      <AnimatePresence mode="wait">
        {state.items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Package className="w-16 h-16 mx-auto text-text-faint mb-4" />
            <h2 className="text-xl font-bold text-text mb-2">السلة فارغة</h2>
            <p className="text-text-muted mb-6">لم تقم بإضافة أي منتجات بعد</p>
            <Link href="/" className="btn-primary inline-block">تصفح المنتجات</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {state.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-4"
                >
                  <div className="flex gap-4">
                    <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                      <Image
                        src={item.image || '/pl1.jpg'}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-xl bg-surface-2"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`}>
                        <h3 className="text-sm font-medium text-text line-clamp-2 hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      {item.selections && item.selections.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.selections.map((s, i) => (
                            <span key={i} className="text-xs text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">
                              {s.variant}: {s.value}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                            className="px-2.5 py-1.5 hover:bg-surface-2 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 py-1.5 text-sm font-medium border-x border-border min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                            className="px-2.5 py-1.5 hover:bg-surface-2 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Price + Delete */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-1.5 text-text-faint hover:text-error transition-colors"
                            aria-label="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-5 sticky top-24">
                <h3 className="font-bold text-text mb-4">ملخص الطلب</h3>

                {/* Coupon */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-text flex items-center gap-1.5 mb-2">
                    <Tag className="w-4 h-4" />
                    كوبون الخصم
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                      placeholder="كود الكوبون"
                      className="input-field !py-2 text-sm flex-1"
                    />
                    {couponCode && (
                      <button
                        onClick={() => { setCouponCode(''); setCouponError('') }}
                        className="p-2 text-text-faint hover:text-error transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-error text-xs mt-1">{couponError}</p>}
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplying || !couponCode.trim()}
                    className="btn-secondary w-full !py-2.5 text-sm mt-2"
                  >
                    {isApplying ? 'جاري التطبيق...' : 'تطبيق'}
                  </button>
                </div>

                {/* Summary rows */}
                {summary && (
                  <div className="space-y-2.5 text-sm border-t border-divider pt-4">
                    <div className="flex justify-between">
                      <span className="text-text-muted">المجموع الفرعي</span>
                      <span>{formatCurrency(summary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">خصم الكوبون</span>
                      <div className="flex items-center gap-2">
                        <span className="text-success">-{formatCurrency(summary.discount)}</span>
                        {summary.coupon?.code && (
                          <button
                            onClick={handleRemoveCoupon}
                            disabled={isApplying}
                            className="text-error hover:bg-red-50 p-1 rounded transition-colors"
                            title="حذف الكوبون"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {summary.shipping_zone && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">الشحن</span>
                        <span>{formatCurrency(summary.shipping_zone.price)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t border-divider pt-3 mt-3">
                      <span>الإجمالي</span>
                      <span className="text-primary">{formatCurrency(summary.total)}</span>
                    </div>
                  </div>
                )}

                <Link
                  href="/checkout"
                  className="btn-primary w-full text-center mt-5 flex items-center justify-center gap-2"
                >
                  إتمام الشراء
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
