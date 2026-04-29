'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Clock, CheckCircle, Truck, XCircle, Eye } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/utils'

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: 'bg-warning/10 text-warning', icon: Clock, label: 'قيد الانتظار' },
  processing: { color: 'bg-info/10 text-info', icon: Package, label: 'قيد التحضير' },
  shipped: { color: 'bg-primary/10 text-primary', icon: Truck, label: 'تم الشحن' },
  delivered: { color: 'bg-success/10 text-success', icon: CheckCircle, label: 'تم التسليم' },
  cancelled: { color: 'bg-error/10 text-error', icon: XCircle, label: 'ملغي' },
}

export default function OrdersPage() {
  const { state: authState } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = '/login?redirect=/account/orders'
      return
    }
    if (!authState.isAuthenticated) return

    async function fetchOrders() {
      try {
        const res = await api.get('/orders')
        if (res.data.status) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || []
          setOrders(data)
        }
      } catch {
        // Silent
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [authState.isAuthenticated, authState.isLoading])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="card p-10 text-center">
        <Package className="w-14 h-14 mx-auto text-text-faint mb-3" />
        <h3 className="text-lg font-bold mb-2">لا توجد طلبات</h3>
        <p className="text-text-muted text-sm mb-4">لم تقم بأي طلبات بعد</p>
        <Link href="/" className="btn-primary inline-block">تسوق الآن</Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order: any) => {
        const status = statusConfig[order.status] || statusConfig.pending
        const StatusIcon = status.icon
        return (
          <div key={order.id} className="card p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-medium">طلب #{order.id}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('ar-EG', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${status.color} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                <span className="font-bold text-primary text-sm">
                  {formatCurrency(order.total || order.grand_total || 0)}
                </span>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-text-muted hover:text-primary"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
