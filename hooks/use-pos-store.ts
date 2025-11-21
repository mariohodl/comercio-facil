import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IProduct } from '@/lib/db/models/product.model';

// POS cart item type including optional SKU
export type POSCartItem = {
    product: string; // Product ID
    name: string;
    slug: string;
    image: string;
    category: string;
    price: number;
    countInStock: number;
    quantity: number;
    sku: string;
};

interface POSState {
    cart: POSCartItem[];
    addToCart: (product: IProduct) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalPrice: () => number;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set, get) => ({
            cart: [],
            addToCart: (product: IProduct) => {
                const { cart } = get();
                const existingItem = cart.find((item) => item.product === product._id);
                if (existingItem) {
                    if (existingItem.quantity + 1 > product.countInStock) return;
                    set({
                        cart: cart.map((item) =>
                            item.product === product._id ? { ...item, quantity: item.quantity + 1 } : item,
                        ),
                    });
                } else {
                    set({
                        cart: [
                            ...cart,
                            {
                                product: product._id,
                                name: product.name,
                                slug: product.slug,
                                image: product.images && product.images[0] ? product.images[0].imgUrl : '/images/logo-prueba.png',
                                category: product.category,
                                price: product.price,
                                countInStock: product.countInStock,
                                quantity: 1,
                                sku: (product as any).sku || 'NO-SKU', // Fallback if SKU is missing in runtime
                            },
                        ],
                    });
                }
            },
            removeFromCart: (productId: string) => {
                set({ cart: get().cart.filter((item) => item.product !== productId) });
            },
            updateQuantity: (productId: string, quantity: number) => {
                const { cart } = get();
                set({
                    cart: cart.map((item) => (item.product === productId ? { ...item, quantity } : item)),
                });
            },
            clearCart: () => set({ cart: [] }),
            totalPrice: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        { name: 'pos-cart-storage' },
    ),
);
