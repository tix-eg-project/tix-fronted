'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import api from '@/lib/api'
import { getCookie } from 'cookies-next'

type WishlistItem = {
  id: number | string
  name: string
  price: number
  originalPrice?: number
  image: string
  discount?: number
}

type WishlistContextType = {
  items: WishlistItem[]
  isLoading: boolean
  addToWishlist: (productId: number | string) => Promise<void>
  removeFromWishlist: (productId: number | string) => Promise<void>
  toggleWishlist: (productId: number | string) => Promise<void>
  isInWishlist: (productId: number | string) => boolean
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshWishlist = useCallback(async () => {
    const token = getCookie('auth_token')
    if (!token) return

    setIsLoading(true)
    try {
      const response = await api.get('/favorites')
      if (response.data.status && Array.isArray(response.data.data)) {
        setItems(
          response.data.data.map((item: any) => ({
            id: item.id || item.product_id,
            name: item.name || item.product?.name,
            price: item.price_after || item.product?.price_after || 0,
            originalPrice: item.price_before || item.product?.price_before,
            image: item.images?.[0] || item.image || item.product?.images?.[0] || '',
            discount: item.discount || 0,
          }))
        )
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const toggleWishlist = useCallback(async (productId: number | string) => {
    const formData = new FormData()
    formData.append('product_id', String(productId))
    await api.post('/favorites/toggle', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await refreshWishlist()
  }, [refreshWishlist])

  const addToWishlist = useCallback(async (productId: number | string) => {
    await toggleWishlist(productId)
  }, [toggleWishlist])

  const removeFromWishlist = useCallback(async (productId: number | string) => {
    await api.delete(`/favorites/${productId}`)
    setItems(prev => prev.filter(i => String(i.id) !== String(productId)))
  }, [])

  const isInWishlist = useCallback((productId: number | string) => {
    return items.some(i => String(i.id) === String(productId))
  }, [items])

  return (
    <WishlistContext.Provider
      value={{ items, isLoading, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
