'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { syncCartItem, clearSyncedCart, getSyncedCart } from '@/app/[locale]/koszyk/actions';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    slug: string;
    configuration?: string;
};

interface CartState {
    items: CartItem[];
    isLoaded: boolean;
    addItem: (item: CartItem, session?: any) => void;
    removeItem: (id: string, session?: any) => void;
    updateQuantity: (id: string, delta: number, session?: any) => void;
    clearCart: (session?: any) => void;
    syncWithServer: () => Promise<void>;
    setLoaded: (status: boolean) => void;
    total: () => number;
    itemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoaded: false,

            setLoaded: (status: boolean) => set({ isLoaded: status }),

            addItem: (newItem, session) => {
                const { items } = get();
                const existing = items.find(i => i.id === newItem.id);
                let updatedItems;

                if (existing) {
                    updatedItems = items.map(i =>
                        i.id === newItem.id
                            ? { ...i, quantity: i.quantity + newItem.quantity }
                            : i
                    );
                } else {
                    updatedItems = [...items, newItem];
                }

                set({ items: updatedItems });

                // Sync with server if logged in
                if (session?.user) {
                    const itemToSync = existing
                        ? { id: newItem.id, quantity: existing.quantity + newItem.quantity, configuration: newItem.configuration }
                        : { id: newItem.id, quantity: newItem.quantity, configuration: newItem.configuration };
                    syncCartItem(itemToSync);
                }
            },

            removeItem: (id, session) => {
                set(state => ({
                    items: state.items.filter(i => i.id !== id)
                }));
                if (session?.user) {
                    syncCartItem({ id, quantity: 0 }, true);
                }
            },

            updateQuantity: (id, delta, session) => {
                const { items } = get();
                let itemToSync: any = null;

                const updated = items.map(i => {
                    if (i.id === id) {
                        const newQty = Math.max(1, i.quantity + delta);
                        itemToSync = { id, quantity: newQty };
                        return { ...i, quantity: newQty };
                    }
                    return i;
                });

                set({ items: updated });

                if (session?.user && itemToSync) {
                    syncCartItem(itemToSync);
                }
            },

            clearCart: (session) => {
                set({ items: [] });
                if (session?.user) {
                    clearSyncedCart();
                }
            },

            syncWithServer: async () => {
                const serverItems = await getSyncedCart();
                if (serverItems && serverItems.length > 0) {
                    set({ items: serverItems });
                }
            },

            total: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
        }),
        {
            name: 'bolglass_cart',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setLoaded(true);
            }
        }
    )
);
