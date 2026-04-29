'use client'
import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import api from '@/lib/api'
import { getCookie } from 'cookies-next'

export type CartItem = {
  id: number | string
  productId: number | string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  variant_item_id?: number | null
  selections?: { variant: string; value: string }[]
}

type CartState = {
  items: CartItem[]
  total: number
  count: number
  isLoading: boolean
}

type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string | number }
  | { type: 'UPDATE_QTY'; payload: { id: string | number; qty: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }

function recalculate(items: CartItem[]) {
  return {
    items,
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    count: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...recalculate(action.payload), isLoading: false }
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      const items = existing
        ? state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          )
        : [...state.items, action.payload]
      return { ...recalculate(items), isLoading: false }
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter(i => i.id !== action.payload)
      return { ...recalculate(items), isLoading: false }
    }
    case 'UPDATE_QTY': {
      const items = state.items
        .map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: Math.max(0, action.payload.qty) }
            : i
        )
        .filter(i => i.quantity > 0)
      return { ...recalculate(items), isLoading: false }
    }
    case 'CLEAR_CART':
      return { items: [], total: 0, count: 0, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

type CartContextType = {
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addToCart: (productId: number | string, quantity?: number, variantItemId?: number | null) => Promise<void>
  removeFromCart: (cartId: number | string) => Promise<void>
  updateQuantity: (cartId: number | string, qty: number) => Promise<void>
  clearCart: () => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    count: 0,
    isLoading: false,
  })

  const refreshCart = useCallback(async () => {
    const token = getCookie('auth_token')
    if (!token) return

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await api.get('/cart')
      if (response.data.status && response.data.data?.data) {
        const items: CartItem[] = response.data.data.data.map((item: any) => ({
          id: item.id,
          productId: item.product?.id,
          name: item.product?.name || '',
          price: item.product?.variant_item?.price_after || item.product?.price_after || 0,
          originalPrice: item.product?.variant_item?.price_before || item.product?.price_before,
          quantity: item.quantity,
          image: item.product?.image || item.product?.images?.[0] || '',
          variant_item_id: item.product?.variant_item?.id,
          selections: item.product?.variant_item?.selections || [],
        }))
        dispatch({ type: 'SET_ITEMS', payload: items })
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Fetch cart on mount (if logged in)
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(async (
    productId: number | string,
    quantity: number = 1,
    variantItemId?: number | null
  ) => {
    const formData = new FormData()
    formData.append('product_id', String(productId))
    formData.append('quantity', String(quantity))
    if (variantItemId) {
      formData.append('product_variant_item_id', String(variantItemId))
    }

    const response = await api.post('/cart/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.data.status) {
      await refreshCart()
    }

    return response.data
  }, [refreshCart])

  const removeFromCart = useCallback(async (cartId: number | string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartId })
    try {
      await api.delete(`/cart/${cartId}`)
      await refreshCart()
    } catch {
      await refreshCart() // Revert on error
    }
  }, [refreshCart])

  const updateQuantity = useCallback(async (cartId: number | string, qty: number) => {
    if (qty < 1) return
    dispatch({ type: 'UPDATE_QTY', payload: { id: cartId, qty } })
    try {
      await api.put(`/cart/${cartId}`, { quantity: qty })
    } catch {
      await refreshCart() // Revert on error
    }
  }, [refreshCart])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  return (
    <CartContext.Provider
      value={{ state, dispatch, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
