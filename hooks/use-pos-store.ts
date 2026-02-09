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
    cartItemId: string; // Unique ID for each entry in the cart
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

export const FRACTIONAL_UNITS = ['kg', 'g', 'gr', 'lb', 'oz', 'l', 'ml', 'mt', 'm'];

// Helper function to generate a unique order number
const generateOrderNumber = (): string => {
    return String(Date.now()).slice(-6);
};

interface POSState {
    cart: POSCartItem[];
    orderNumber: string;
    customerId: string;
    userId: string | null;
    addToCart: (product: IProduct, variant?: IVariant) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    duplicateItem: (cartItemId: string) => void;
    clearCart: () => void;
    setCart: (items: POSCartItem[]) => void;
    setCustomerId: (id: string) => void;
    setUserId: (id: string | null) => void;
    totalPrice: () => number;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set, get) => ({
            cart: [],
            orderNumber: generateOrderNumber(),
            customerId: 'walk-in',
            userId: null,
            addToCart: (product: IProduct, variant?: IVariant) => {
                const { cart } = get();
                const unit = ((product as any).unitId?.abbreviation || product.unit || '').toLowerCase();
                const isFractional = FRACTIONAL_UNITS.includes(unit);

                // Determine if we should add as a new item or increment existing
                // Fractional items ALWAYS add a new entry if they already exist, 
                // but for standard items we group them.
                const existingItem = !isFractional ? cart.find((item) =>
                    item.product === product._id && item.variantSku === (variant?.sku || undefined)
                ) : null;

                const stockLimit = Math.floor((variant ? variant.countInStock : product.countInStock) * 1000) / 1000;

                // Calculate total existing quantity of THIS specific product/variant in cart
                const totalInCartRaw = cart
                    .filter(item => item.product === product._id && item.variantSku === (variant?.sku || undefined))
                    .reduce((sum, item) => sum + item.quantity, 0);
                const totalInCart = Math.floor(totalInCartRaw * 1000) / 1000;

                if (existingItem) {
                    if (totalInCart + 1 > stockLimit) return;
                    set({
                        cart: cart.map((item) =>
                            (item.cartItemId === existingItem.cartItemId)
                                ? { ...item, quantity: item.quantity + 1 }
                                : item,
                        ),
                    });
                } else {
                    if (totalInCart + 1 > stockLimit) return;
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
                                cartItemId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
                                product: product._id,
                                name: product.name,
                                slug: product.slug,
                                image: imageUrl,
                                category: product.category,
                                price: price,
                                countInStock: stockLimit,
                                quantity: 1,
                                sku: variant?.sku || (product as any).sku || 'NO-SKU',
                                unit: unit || 'unit',
                                variantSku: variant?.sku,
                                variantDetails: variantDetails
                            },
                        ],
                    });
                }
            },
            removeFromCart: (cartItemId: string) => {
                set({
                    cart: get().cart.filter((item) => item.cartItemId !== cartItemId)
                });
            },
            updateQuantity: (cartItemId: string, quantity: number) => {
                const { cart } = get();
                const item = cart.find((i) => i.cartItemId === cartItemId);
                if (!item) return;

                // Calculate total of this product in cart EXCLUDING this specific cartItemId
                const totalOthersRaw = cart
                    .filter((i) => i.cartItemId !== cartItemId && i.product === item.product && i.variantSku === item.variantSku)
                    .reduce((sum, i) => sum + i.quantity, 0);
                const totalOthers = Math.floor(totalOthersRaw * 1000) / 1000;

                const stockLimit = item.countInStock;

                // Check if new total exceeds stock
                const cleanQuantity = Math.floor(quantity * 1000) / 1000;
                const newTotal = Math.floor((totalOthers + cleanQuantity) * 1000) / 1000;

                if (newTotal > stockLimit) {
                    // Adjust to maximum possible if exceeded
                    const maxAllowed = Math.floor(Math.max(0, stockLimit - totalOthers) * 1000) / 1000;

                    if (Math.abs(maxAllowed - item.quantity) < 0.0001) return;

                    set({
                        cart: cart.map((i) =>
                            i.cartItemId === cartItemId
                                ? { ...i, quantity: maxAllowed }
                                : i
                        ),
                    });
                    return;
                }

                set({
                    cart: cart.map((i) =>
                        i.cartItemId === cartItemId
                            ? { ...i, quantity: cleanQuantity }
                            : i
                    ),
                });
            },
            duplicateItem: (cartItemId: string) => {
                const { cart } = get();
                const itemToDuplicate = cart.find(i => i.cartItemId === cartItemId);
                if (itemToDuplicate) {
                    // Check stock before duplicating
                    const totalInCartForProductRaw = cart
                        .filter(i => i.product === itemToDuplicate.product && i.variantSku === itemToDuplicate.variantSku)
                        .reduce((sum, i) => sum + i.quantity, 0);
                    const totalInCartForProduct = Math.floor(totalInCartForProductRaw * 1000) / 1000;

                    // Standard duplication adds 1 unit
                    const newTotal = Math.floor((totalInCartForProduct + 1) * 1000) / 1000;
                    if (newTotal > Math.floor(itemToDuplicate.countInStock * 1000) / 1000) {
                        return; // Not enough stock to add 1 more unit
                    }

                    const newItem = {
                        ...itemToDuplicate,
                        cartItemId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
                        quantity: 1 // Always start with 1 for duplication as requested
                    };
                    set({ cart: [...cart, newItem] });
                }
            },
            setCart: (items: POSCartItem[]) => set({
                cart: items.map(i => ({
                    ...i,
                    quantity: Math.floor(i.quantity * 1000) / 1000,
                    countInStock: Math.floor(i.countInStock * 1000) / 1000
                }))
            }),
            setCustomerId: (id: string) => set({ customerId: id }),
            setUserId: (id: string | null) => set({ userId: id }),
            clearCart: () => set({ cart: [], orderNumber: generateOrderNumber(), customerId: 'walk-in' }),
            totalPrice: () => {
                const total = get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
                return Math.round(total * 100) / 100;
            },
        }),
        { name: 'pos-cart-storage' },
    ),
);
