export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
  section?: 'packaging' | 'ai-solutions';
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  categoryId: CategoryId;
  images: string[];
  rating: number;
  reviews: Review[];
  features?: string[];
  isFeatured?: boolean;
  isContactForPrice?: boolean;
  moq?: number;
  uom?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
