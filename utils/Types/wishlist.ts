export interface WishlistItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
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
