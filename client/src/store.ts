import { create } from 'zustand';
import { Product, CartItem } from './types';

interface User {
  name: string;
  email: string;
}

interface AppState {
  cart: CartItem[];
  wishlist: string[]; // array of product IDs
  theme: 'light' | 'dark';
  user: User | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  toggleTheme: () => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  cart: [],
  wishlist: [],
  theme: 'light',
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  addToCart: (product, quantity = 1) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { product, quantity }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((i) => i.product.id !== productId) })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ cart: [] }),
  toggleWishlist: (productId) =>
    set((state) => ({
      wishlist: state.wishlist.includes(productId)
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId],
    })),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    }),
}));
