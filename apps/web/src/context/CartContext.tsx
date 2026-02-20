'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getSyncedCart, syncCartItem, clearSyncedCart } from '@/app/[locale]/koszyk/actions';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    slug: string;
    configuration?: string;
};

type CartContextType = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('bolglass_cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && Array.isArray(parsed)) {
                    setItems(parsed);
                }
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Sync with Server on Login
    useEffect(() => {
        if (status === 'authenticated' && isLoaded) {
            getSyncedCart().then(serverItems => {
                if (serverItems && serverItems.length > 0) {
                    // Simple strategy: Server wins or merge? 
                    // Let's use Server items, but if we had local items, maybe we should have merged.
                    // For now, let's just use Server state to ensure cross-device consistency.
                    // TODO: Implement smart merge (local + server)
                    setItems(serverItems);
                }
            });
        }
    }, [status, isLoaded]);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('bolglass_cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (newItem: CartItem) => {
        setItems(current => {
            const existing = current.find(i => i.id === newItem.id);
            let updatedItems;
            if (existing) {
                updatedItems = current.map(i =>
                    i.id === newItem.id
                        ? { ...i, quantity: i.quantity + newItem.quantity }
                        : i
                );
            } else {
                updatedItems = [...current, newItem];
            }

            // Sync to server
            if (session?.user) {
                const itemToSync = existing
                    ? { id: newItem.id, quantity: existing.quantity + newItem.quantity, configuration: newItem.configuration }
                    : { id: newItem.id, quantity: newItem.quantity, configuration: newItem.configuration };
                syncCartItem(itemToSync);
            }

            return updatedItems;
        });
    };

    const removeItem = (id: string) => {
        setItems(current => {
            const updated = current.filter(i => i.id !== id);
            // Sync to server
            if (session?.user) {
                syncCartItem({ id, quantity: 0 }, true);
            }
            return updated;
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems(current => {
            let itemToSync: { id: string, quantity: number } | null = null;

            const updated = current.map(i => {
                if (i.id === id) {
                    const newQty = Math.max(1, i.quantity + delta);
                    itemToSync = { id, quantity: newQty };
                    return { ...i, quantity: newQty };
                }
                return i;
            });

            if (session?.user && itemToSync) {
                syncCartItem(itemToSync);
            }

            return updated;
        });
    };

    const clearCart = () => {
        setItems([]);
        if (session?.user) {
            clearSyncedCart();
        }
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
