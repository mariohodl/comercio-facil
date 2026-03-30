import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import User from '@/lib/db/models/user.model'
import CashRegisterSession from '@/lib/db/models/cash-register.model'
import { POSOrderSchema } from '@/lib/validator'
import { NextResponse } from 'next/server'
import { ROL_SELLER, ROL_SUPER_ADMIN, ROL_ADMIN } from '@/lib/constants'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || (session.user.role !== ROL_ADMIN && session.user.role !== ROL_SELLER && session.user.role !== ROL_SUPER_ADMIN)) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (!session.user.id) {
            return NextResponse.json(
                { message: 'User ID is missing from session' },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Verify the user exists in the database
        const mockUserIds = ['65abc0000000000000000000', '65abc0000000000000000001', '65abc0000000000000000002'];

        if (!mockUserIds.includes(session.user.id)) {
            const dbUser = await User.findById(session.user.id)
            if (!dbUser) {
                return NextResponse.json(
                    { message: 'Authenticated user not found in database. Please log out and log back in.' },
                    { status: 401 }
                )
            }
        }

        const body = await req.json()
        const validation = POSOrderSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const { items, paymentMethod, totalPrice } = validation.data

        // Database connection already established for user check

        // Verify stock for all items first
        for (const item of items) {
            const product = await Product.findById(item.product)
            if (!product) {
                return NextResponse.json(
                    { message: `Product not found: ${item.name}` },
                    { status: 404 }
                )
            }

            if (item.variantSku) {
                if (!product.variants || product.variants.length === 0) {
                    return NextResponse.json(
                        { message: `Product ${item.name} has no variants defined but variant SKU was provided` },
                        { status: 400 }
                    );
                }
                const variant = product.variants.find((v: any) => v.sku === item.variantSku);
                if (!variant) {
                    return NextResponse.json(
                        { message: `Variant not found for product ${item.name} with SKU ${item.variantSku}` },
                        { status: 404 }
                    );
                }
                if (variant.countInStock < item.quantity) {
                    return NextResponse.json(
                        { message: `Insufficient stock for variant ${item.name} (${item.variantSku})` },
                        { status: 400 }
                    );
                }
                // Also check the main product's total stock (it should be aggregate)
                if (product.countInStock < item.quantity) {
                    return NextResponse.json(
                        { message: `Insufficient total stock for product: ${item.name}` },
                        { status: 400 }
                    );
                }
            } else {
                if (product.countInStock < item.quantity) {
                    return NextResponse.json(
                        { message: `Insufficient stock for: ${item.name}` },
                        { status: 400 }
                    )
                }
            }
        }

        // Create Order
        // We use a dummy address for POS orders since they are picked up immediately
        const dummyAddress = {
            fullName: 'POS Customer',
            street: 'Store Pickup',
            city: 'Store Location',
            postalCode: '00000',
            country: 'Local',
            province: 'Local',
            phone: '0000000000',
        }

        const { getMXTime } = await import('@/lib/db/setup')
        const orderDate = validation.data.createdAt ? new Date(validation.data.createdAt) : getMXTime()

        // Final safety check for customer ID format to prevent Mongoose CastError
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        const customerId = validation.data.customerId && isValidObjectId(validation.data.customerId)
            ? validation.data.customerId
            : undefined;

        const newOrder = new Order({
            user: session.user.id, // The admin user processing the sale
            items: items.map((item) => ({
                ...item,
                clientId: 'POS', // generic client id
            })),
            shippingAddress: dummyAddress,
            paymentMethod,
            paymentSplits: validation.data.paymentSplits,
            itemsPrice: totalPrice,
            shippingPrice: 0,
            taxPrice: 0, // Simplified for POS, or calculate if needed
            totalPrice,
            isPaid: validation.data.isPaid !== undefined ? validation.data.isPaid : true,
            paidAt: validation.data.isPaid !== false ? orderDate : undefined,
            isDelivered: validation.data.fulfillmentType === 'IN_STORE' || validation.data.fulfillmentType === undefined,
            deliveredAt: (validation.data.fulfillmentType === 'IN_STORE' || validation.data.fulfillmentType === undefined) ? orderDate : undefined,
            expectedDeliveryDate: orderDate,
            isRounded: validation.data.isRounded,
            amountRounded: validation.data.amountRounded,
            storeId: body.storeId,
            customer: customerId,
            fulfillmentType: validation.data.fulfillmentType || 'IN_STORE',
            fulfillmentStatus: (validation.data.fulfillmentType === 'IN_STORE' || validation.data.fulfillmentType === undefined) ? 'DELIVERED' : 'PENDING',
            createdAt: orderDate,
        })

        const createdOrder = await newOrder.save()

        // Revalidate relevant paths
        const { revalidatePath } = await import('next/cache')
        if (body.storeId) {
            revalidatePath(`/admin/${body.storeId}/overview`)
            revalidatePath(`/admin/${body.storeId}/sales`)
            revalidatePath(`/admin/${body.storeId}/stock/low-stocks`)
        }

        // Update Stock
        for (const item of items) {
            if (item.variantSku) {
                // Fetch product to get current variant stock
                const product = await Product.findById(item.product);
                if (product && product.variants) {
                    const variant = product.variants.find((v: any) => v.sku === item.variantSku);
                    if (variant) {
                        const newVariantStock = Math.floor((variant.countInStock - item.quantity) * 1000) / 1000;
                        const newParentStock = Math.floor((product.countInStock - item.quantity) * 1000) / 1000;
                        const newSales = Math.floor((product.numSales + item.quantity) * 1000) / 1000;

                        await Product.updateOne(
                            { _id: item.product, "variants.sku": item.variantSku },
                            {
                                $set: {
                                    "variants.$.countInStock": newVariantStock,
                                    "countInStock": newParentStock,
                                    "numSales": newSales
                                }
                            }
                        );
                    }
                }
            } else {
                const product = await Product.findById(item.product);
                if (product) {
                    const newStock = Math.floor((product.countInStock - item.quantity) * 1000) / 1000;
                    const newSales = Math.floor((product.numSales + item.quantity) * 1000) / 1000;

                    await Product.findByIdAndUpdate(item.product, {
                        $set: {
                            countInStock: newStock,
                            numSales: newSales
                        }
                    });
                }
            }
        }

        // Validated that stock update happens before this

        // --- CASH REGISTER LOGIC ---
        // Only log if order is paid
        if (createdOrder.isPaid) {
            // Find active session
            const cashRegisterSession = await CashRegisterSession.findOne({
                storeId: body.storeId, // Now passed from frontend for all roles
                userId: session.user.id,
                status: 'open'
            })

            if (cashRegisterSession) {
                cashRegisterSession.movements.push({
                    type: 'sale',
                    amount: totalPrice, // Using total price including tax/rounding
                    paymentMethod: paymentMethod, // 'Cash' or 'Card' usually
                    orderId: createdOrder._id,
                    notes: 'POS Sale',
                    createdAt: orderDate
                })
                await cashRegisterSession.save()
            }
        }

        return NextResponse.json(
            { message: 'Order created successfully', order: createdOrder },
            { status: 201 }
        )
    } catch (error: unknown) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}

