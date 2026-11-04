import type { ProductColor } from "./products";

export interface WishlistItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  discount?: number;
  colors?: ProductColor[];
}

export interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: number | string) => Promise<void>;
  removeFromWishlist: (productId: number | string) => Promise<void>;
  toggleWishlist: (productId: number | string) => Promise<void>;
  isInWishlist: (productId: number | string) => boolean;
  refreshWishlist: () => Promise<void>;
}
