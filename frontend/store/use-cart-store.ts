import { create } from "zustand";
import type { CartItem } from "../../shared/types/index";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.menuId === item.menuId);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.menuId === item.menuId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (menuId) =>
    set((state) => ({
      items: state.items.filter((i) => i.menuId !== menuId),
    })),

  updateQuantity: (menuId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.menuId === menuId ? { ...i, quantity } : i
      ),
    })),

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const items = get().items;
    return items.reduce((total, item) => {
      const price = item.menu?.price || 0;
      return total + price * item.quantity;
    }, 0);
  },
}));
