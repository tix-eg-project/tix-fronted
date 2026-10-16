export interface LoyaltySummary {
  is_active: boolean;
  balance: number;
  earn_rate_amount: number;
  max_points_per_order: number;
  products_count: number;
}

export type LoyaltyHistoryType =
  | "earned"
  | "redeemed"
  | "refunded"
  | "reverted"
  | "manual_add"
  | "manual_deduct";

export interface LoyaltyHistoryItem {
  id: number;
  order_id: number | null;
  type: LoyaltyHistoryType;
  points: number;
  direction: "in" | "out";
  note: string | null;
  created_at: string;
}

export interface LoyaltyHistoryResponse {
  items: LoyaltyHistoryItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LoyaltyCheckoutPreview {
  balance: number;
  points_required: number;
  points_after: number;
  enough_points: boolean;
  reason: string | null;
  cash_products: number;
  will_earn: number;
}

export interface LoyaltyProduct {
  id: number | string;
  name: string;
  images: string[];
  points_price: number;
  affordable: boolean;
  points_short: number;
}

export interface LoyaltyProductsResponse {
  balance: number;
  items: LoyaltyProduct[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
