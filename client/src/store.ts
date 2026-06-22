import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from './types';
import { setTokenGetter, getProfile } from './lib/api';

interface User {
  name: string;
  email: string;
}

interface AppState {
  cart: CartItem[];
  wishlist: string[];
  theme: 'light' | 'dark';
  user: User | null;
  token: string | null;
  isTokenValid: () => boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  toggleTheme: () => void;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      // Initialize API token getter - called when store is created
      setTokenGetter(() => get().token);

      return {
        cart: [],
        wishlist: [],
        theme: 'light',
        user: null,
        token: null,

        // Helper to check if token exists
        isTokenValid: () => !!get().token,

        setAuth: (token, user) => {
          set({ token, user });
          // Token is automatically persisted to localStorage by persist middleware
        },

        logout: () => {
          set({ token: null, user: null });
          // localStorage is automatically cleared by persist middleware
        },

        restoreSession: async () => {
          const { token } = get();
          if (!token) {
            console.log('[Auth] No stored token found');
            return;
          }
          try {
            console.log('[Auth] Restoring session with stored token');
            const profile = await getProfile();
            set({
              user: { name: profile.name, email: profile.email },
            });
            console.log('[Auth] Session restored successfully for:', profile.email);
          } catch (err) {
            console.error('[Auth] Session restoration failed:', err);
            set({ token: null, user: null });
          }
        },

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
      };
    },
    {
      name: 'kalisoft-storage',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        theme: state.theme,
        token: state.token,
        user: state.user,
      }),
    }
  )
);
