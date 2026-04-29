import type { Dispatch } from "react";
import type { VariantItem, VariantSelection } from "./common";

export interface CartItem {
  id: number | string;
  productId: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  variant_item_id?: number | null;
  variant_item?: VariantItem | null;
  selections?: VariantSelection[];
}

export interface CartState {
  items: CartItem[];
  total: number;
  count: number;
  isLoading: boolean;
}

export type CartAction =
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string | number }
  | { type: "UPDATE_QTY"; payload: { id: string | number; qty: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOADING"; payload: boolean };

export interface CartContextType {
  state: CartState;
  dispatch: Dispatch<CartAction>;
  addToCart: (
    productId: number | string,
    quantity?: number,
    variantItemId?: number | null,
  ) => Promise<void>;
  removeFromCart: (cartId: number | string) => Promise<void>;
  updateQuantity: (cartId: number | string, qty: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}
