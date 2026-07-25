export interface Product {
  _id: string;
  slug: string;
  name: string;
  category: "t-shirts" | "hoodies" | "pyjamas";
  price: number;
  originalPrice?: number; // present when the item is discounted
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isBestseller?: boolean;
  colors?: string[]; // hex values, e.g. ["#1C1B19", "#6B5B45"]
  sizes?: ("S" | "M" | "L" | "XL" | "XXL")[];
}
export interface ShopFilters {
  categories: string[]; // e.g. ["t-shirts", "hoodies"]
  maxPrice: number;
  sizes: string[]; // e.g. ["M", "L"]
  colors: string[]; // hex values
}

export const DEFAULT_FILTERS: ShopFilters = {
  categories: [],
  maxPrice: 3000,
  sizes: [],
  colors: [],
};

export type SortOption =
  | "featured"
  | "price-low-high"
  | "price-high-low"
  | "newest";

export interface CartItem {
  id: string; // unique per line item (productId + size + color)
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}