import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart store using Zustand with localStorage persistence.
 * Zustand is simpler than Context + useReducer for this use case.
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],           // Array of { id, name, price, image, quantity, restaurantId }
      restaurantId: null,  // Cart is locked to one restaurant at a time
      restaurantName: '',

      addItem: (item, restaurant) => {
        const { items, restaurantId } = get();

        // If cart has items from a different restaurant, alert user
        if (restaurantId && restaurantId !== restaurant.id) {
          return { error: 'different_restaurant', restaurantName: get().restaurantName };
        }

        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
          });
        }
        return { success: true };
      },

      removeItem: (itemId) => {
        const items = get().items.filter((i) => i.id !== itemId);
        set({
          items,
          // Reset restaurant if cart is empty
          restaurantId: items.length === 0 ? null : get().restaurantId,
          restaurantName: items.length === 0 ? '' : get().restaurantName,
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: '' }),

      // Computed values
      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    {
      name: 'foodapp-cart', // localStorage key
    }
  )
);

export default useCartStore;
