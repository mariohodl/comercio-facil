import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IProduct } from '@/lib/db/models/product.model';

export interface IVariant {
    sku: string;
    costPerUnit: number;
    listPrice: number;
    discountPrice?: number;
    discountType?: string;
    discountValue?: number;
    countInStock: number;
    attributes: { name: string; value: string }[];
    images?: { imgUrl: string; imgKey: string }[];
    barcode?: string;
    taxType?: string;
    tax?: number;
}

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
    unit: string;
    variantSku?: string;
    variantDetails?: string;
};

interface POSState {
    cart: POSCartItem[];
    addToCart: (product: IProduct, variant?: IVariant) => void;
    removeFromCart: (productId: string, variantSku?: string) => void;
    updateQuantity: (productId: string, quantity: number, variantSku?: string) => void;
    clearCart: () => void;
    totalPrice: () => number;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set, get) => ({
            cart: [],
            addToCart: (product: IProduct, variant?: IVariant) => {
                const { cart } = get();
                // Determine unique item key by product ID and variant SKU (if present)
                const existingItem = cart.find((item) =>
                    item.product === product._id && item.variantSku === (variant?.sku || undefined)
                );

                const stockLimit = variant ? variant.countInStock : product.countInStock;

                if (existingItem) {
                    if (existingItem.quantity + 1 > stockLimit) return;
                    set({
                        cart: cart.map((item) =>
                            (item.product === product._id && item.variantSku === (variant?.sku || undefined))
                                ? { ...item, quantity: item.quantity + 1 }
                                : item,
                        ),
                    });
                } else {
                    const price = variant
                        ? (variant.discountPrice && variant.discountPrice > 0 ? variant.discountPrice : variant.listPrice)
                        : (product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.listPrice);

                    const imageUrl = variant?.images?.[0]?.imgUrl || (product.images && product.images[0] ? product.images[0].imgUrl : '/images/logo-prueba.png');

                    const variantDetails = variant
                        ? variant.attributes.map(attr => `${attr.value}`).join(' / ')
                        : undefined;

                    set({
                        cart: [
                            ...cart,
                            {
                                product: product._id,
                                name: product.name,
                                slug: product.slug,
                                image: imageUrl,
                                category: product.category,
                                price: price,
                                countInStock: stockLimit,
                                quantity: 1,
                                sku: variant?.sku || (product as any).sku || 'NO-SKU',
                                unit: product.unit,
                                variantSku: variant?.sku,
                                variantDetails: variantDetails
                            },
                        ],
                    });
                }
            },
            removeFromCart: (productId: string, variantSku?: string) => {
                set({
                    cart: get().cart.filter((item) =>
                        !(item.product === productId && item.variantSku === variantSku)
                    )
                });
            },
            updateQuantity: (productId: string, quantity: number, variantSku?: string) => {
                const { cart } = get();
                set({
                    cart: cart.map((item) =>
                        (item.product === productId && item.variantSku === variantSku)
                            ? { ...item, quantity }
                            : item
                    ),
                });
            },
            clearCart: () => set({ cart: [] }),
            totalPrice: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        { name: 'pos-cart-storage' },
    ),
);
