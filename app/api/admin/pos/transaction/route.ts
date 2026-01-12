import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import CashRegisterSession from '@/lib/db/models/cash-register.model'
import { POSOrderSchema } from '@/lib/validator'
import { NextResponse } from 'next/server'
import { ROL_SELLER, ROL_SUPER_ADMIN } from '@/lib/constants'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || (session.user.role !== 'admin' && session.user.role !== ROL_SELLER && session.user.role !== ROL_SUPER_ADMIN)) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
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

        await connectToDatabase()

        // Verify stock for all items first
        for (const item of items) {
            const product = await Product.findById(item.product)
            if (!product) {
                return NextResponse.json(
                    { message: `Product not found: ${item.name}` },
                    { status: 404 }
                )
            }
            if (product.countInStock < item.quantity) {
                return NextResponse.json(
                    { message: `Insufficient stock for: ${item.name}` },
                    { status: 400 }
                )
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
            paidAt: validation.data.isPaid !== false ? new Date() : undefined,
            isDelivered: true,
            deliveredAt: new Date(),
            expectedDeliveryDate: new Date(),
            isRounded: validation.data.isRounded,
            amountRounded: validation.data.amountRounded,
            storeId: body.storeId,
        })

        const createdOrder = await newOrder.save()

        // Update Stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: -item.quantity, numSales: item.quantity },
            })
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
                    createdAt: new Date()
                })
                await cashRegisterSession.save()
            }
        }
        // ---------------------------

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

