/** One color option for a product — only colors with stock are included. */
export interface ProductColor {
  name: string;
  /** Hex for the swatch circle; null when the color has no hex set. */
  code: string | null;
  image: string;
}

export interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  discount?: number;
  isFlashDeal?: boolean;
  offerId?: number | string;
  colors?: ProductColor[];
}
