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
}
