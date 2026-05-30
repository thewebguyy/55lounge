import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItemDto } from '@servia/shared';

export interface CartItem {
  menuItem: MenuItemDto;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (menuItem: MenuItemDto) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (menuItem) => set((state) => {
        const existingItem = state.items.find((i) => i.menuItem.id === menuItem.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, { menuItem, quantity: 1 }] };
      }),
      removeItem: (menuItemId) => set((state) => ({
        items: state.items.filter((i) => i.menuItem.id !== menuItemId),
      })),
      updateQuantity: (menuItemId, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.menuItem.id === menuItemId ? { ...i, quantity: Math.max(1, quantity) } : i
        ),
      })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
      },
    }),
    {
      name: 'servia-cart',
    }
  )
);
