import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from './types';
import { setTokenGetter, getProfile, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist, getWishlist } from './lib/api';

interface User {
  name: string;
  email: string;
  role: string;
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
  toggleWishlist: (productId: string) => Promise<void>;
  syncWishlistFromBackend: () => Promise<void>;
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
          localStorage.setItem('kalisoft-role', user.role);
          set({ token, user });
          get().syncWishlistFromBackend();
        },

        logout: () => {
          localStorage.removeItem('kalisoft-role');
          set({ token: null, user: null });
        },

        restoreSession: async () => {
          const tokenAtStart = get().token;
          if (!tokenAtStart) {
            console.log('[Auth] No stored token found');
            return;
          }
          try {
            console.log('[Auth] Restoring session with stored token');
            const profile = await getProfile();
            if (get().token !== tokenAtStart) return;
            set({
              user: { name: profile.name, email: profile.email, role: profile.role },
            });
            await get().syncWishlistFromBackend();
            console.log('[Auth] Session restored successfully for:', profile.email);
          } catch (err) {
            console.error('[Auth] Session restoration failed:', err);
            if (get().token === tokenAtStart) {
              set({ token: null, user: null });
            }
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

        toggleWishlist: async (productId) => {
          const { wishlist, token } = get();
          const wasIn = wishlist.includes(productId);
          const prev = wishlist;

          set({
            wishlist: wasIn
              ? wishlist.filter((id) => id !== productId)
              : [...wishlist, productId],
          });

          if (!token) return;

          try {
            if (wasIn) {
              await apiRemoveFromWishlist(productId);
            } else {
              await apiAddToWishlist(productId);
            }
          } catch {
            set({ wishlist: prev });
          }
        },

        syncWishlistFromBackend: async () => {
          if (!get().token) return;
          try {
            const items = await getWishlist();
            const backendIds = new Set(items.map((i) => i.product_id));
            const localIds = new Set(get().wishlist);
            const merged = [...new Set([...backendIds, ...localIds])];
            set({ wishlist: merged });
          } catch {
            /* silent — keep local copy */
          }
        },

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
