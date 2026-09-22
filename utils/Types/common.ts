export interface Product {
  id: number | string;
  name: string;
  short_description?: string;
  long_description?: string;
  price_before: number;
  price_after: number;
  discount: number;
  images: string[];
  category?: string;
  subcategory?: string;
  brand?: string;
  is_fav: boolean;
  features?: string[];
  faqs?: ProductFaq[];
  reviews?: ProductReviews;
  /** @deprecated use variant_options / variant_items */
  groups?: VariantGroup[];
  vendor?: {
    id: number;
    store_name: string | null;
  };
  /** @deprecated use variant_options / variant_items */
  primary_variant?: string;
  variant_options?: VariantOption[];
  variant_items?: VariantItemFull[];
}

export interface ProductFaq {
  id: number;
  question: string;
  answer: string;
}

export interface ProductReviews {
  data: Review[];
  average_rating: number | null;
  count: number;
}

export interface Review {
  id: number;
  rating: number;
  review: string | null;
  user_name: string;
  created_at: string;
}

export interface VariantGroup {
  value: string;
  meta: { code?: string } | null;
  items: VariantItem[];
}

export interface VariantItem {
  id: number;
  key: string;
  attrs: Record<string, string>;
  price_before: number;
  price_after: number;
  discount: number;
  quantity?: number;
  /** @deprecated use `images` - kept in sync as images[0] */
  image?: string | null;
  /** Every photo on this combination; empty when it has none. */
  images?: string[];
}

/**
 * One selectable value under a variant type (e.g. "Red" under "Color").
 * `meta.code` being present is what tells the storefront to render this
 * type's values as colour swatches instead of text pills.
 */
export interface VariantOptionValue {
  id: number;
  name: string;
  meta: { code?: string } | null;
}

/** One variant type actually used by a purchasable item (Size, Color, ...). */
export interface VariantOption {
  id: number;
  name: string;
  values: VariantOptionValue[];
}

/** One variant-type/value pair this item is priced on. */
export interface VariantItemOption {
  type_id: number;
  value_id: number;
}

/**
 * A purchasable combination, replacing the old "primary variant + groups"
 * model. `options` is the exact set of dimensions this combination is priced
 * on - it may cover every variant type, just one, or none - so a size sold
 * with no colour and a size+colour combo are both represented the same way,
 * instead of one of them being silently dropped.
 *
 * A plain list of pairs, not an object keyed by type id: the API cannot use
 * that shape (Laravel's resource filtering reindexes and drops the keys of
 * any nested array whose keys are all numeric) - see lib/variantMatch.ts,
 * which converts this into a lookup map for matching.
 */
export interface VariantItemFull extends VariantItem {
  options: VariantItemOption[];
}

export interface VariantSelection {
  variant: string;
  value: string;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
  shipping_zone?: {
    name: string;
    price: number;
  };
  coupon?: {
    code: string;
    discount: number;
  };
}

export interface User {
  id: number | string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  image?: string | null;
  image_url?: string | null;
  avatar?: string;
}

export interface Order {
  id: number | string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number | string;
  product_name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Category {
  id: number | string;
  name: string;
  image?: string;
  slug?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number | string;
  name: string;
  category_id: number | string;
  image?: string;
  subsubcategories?: Subsubcategory[];
}

export interface Subsubcategory {
  id: number | string;
  name: string;
  subcategory_id?: number | string;
  image?: string;
}

export interface Brand {
  id: number | string;
  name: string;
  logo?: string;
}

export interface Banner {
  id: number | string;
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  link?: string;
}

export interface Offer {
  id: number | string;
  name: string;
  image?: string;
  products?: Product[];
}

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ShippingCity {
  id: number | string;
  name: string;
  price: number;
}

export interface PaymentMethod {
  id: number | string;
  name: string;
  type?: string;
  description?: string;
}

