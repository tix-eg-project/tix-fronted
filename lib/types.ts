// ─── Product ─────────────────────────────────────

export interface Product {
  id: number | string
  name: string
  short_description?: string
  long_description?: string
  price_before: number
  price_after: number
  discount: number
  images: string[]
  category?: string
  subcategory?: string
  brand?: string
  is_fav: boolean
  features?: string[]
  faqs?: ProductFaq[]
  reviews?: ProductReviews
  groups?: VariantGroup[]
  vendor?: {
    id: number
    store_name: string | null
  }
  primary_variant?: string
}

export interface ProductFaq {
  id: number
  question: string
  answer: string
}

export interface ProductReviews {
  data: Review[]
  average_rating: number | null
  count: number
}

export interface Review {
  id: number
  rating: number
  review: string | null
  user_name: string
  created_at: string
}

export interface VariantGroup {
  value: string
  meta: { code?: string } | null
  items: VariantItem[]
}

export interface VariantItem {
  id: number
  key: string
  attrs: Record<string, string>
  price_before: number
  price_after: number
  discount: number
}

// ─── Cart ─────────────────────────────────────────

export interface CartItem {
  id: number | string
  productId: number | string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  discount?: number
  variant_item?: VariantItem | null
  selections?: VariantSelection[]
}

export interface VariantSelection {
  variant: string
  value: string
}

export interface CartSummary {
  subtotal: number
  discount: number
  total: number
  shipping_zone?: {
    name: string
    price: number
  }
  coupon?: {
    code: string
    discount: number
  }
}

// ─── User ─────────────────────────────────────────

export interface User {
  id: number | string
  name: string
  email: string
  phone?: string
  avatar?: string
}

// ─── Order ────────────────────────────────────────

export interface Order {
  id: number | string
  status: string
  total: number
  created_at: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number | string
  product_name: string
  quantity: number
  price: number
  image: string
}

// ─── Category ─────────────────────────────────────

export interface Category {
  id: number | string
  name: string
  image?: string
  slug?: string
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: number | string
  name: string
  category_id: number | string
}

// ─── Brand ────────────────────────────────────────

export interface Brand {
  id: number | string
  name: string
  logo?: string
}

// ─── Banner ───────────────────────────────────────

export interface Banner {
  id: number | string
  image: string
  title?: string
  subtitle?: string
  link?: string
}

// ─── Offer ────────────────────────────────────────

export interface Offer {
  id: number | string
  name: string
  image?: string
  products?: Product[]
}

// ─── API Response ─────────────────────────────────

export interface ApiResponse<T> {
  status: boolean
  message?: string
  data: T
}

export interface PaginatedResponse<T> {
  status: boolean
  data: {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// ─── Shipping ─────────────────────────────────────

export interface ShippingCity {
  id: number | string
  name: string
  price: number
}

// ─── Payment ──────────────────────────────────────

export interface PaymentMethod {
  id: number | string
  name: string
  type?: string
  description?: string
}
