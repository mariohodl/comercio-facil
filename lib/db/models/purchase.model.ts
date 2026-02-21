import { Schema, model, models, Document, Model } from 'mongoose'
import { PurchaseInputSchema } from '@/lib/validator'
import { z } from 'zod'

export type IPurchaseInput = z.infer<typeof PurchaseInputSchema>

export interface IPurchase extends Document, Omit<IPurchaseInput, 'supplierId' | 'items'> {
    _id: string
    supplierId: Schema.Types.ObjectId
    items: {
        productId: Schema.Types.ObjectId
        name: string
        quantity: number
        costPrice: number
        tax?: number
        subtotal: number
    }[]
    createdAt: Date
    updatedAt: Date
}

const purchaseSchema = new Schema<IPurchase>(
    {
        supplierId: {
            type: Schema.Types.ObjectId,
            ref: 'Proveedor',
            required: false,
        },
        reference: {
            type: String,
            required: true,
            trim: true,
        },
        purchaseDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['Received', 'Pending', 'Ordered', 'Cancelled', 'Completed', 'WithExchanges'],
            default: 'Pending',
            required: true,
        },
        type: {
            type: String,
            enum: ['Normal', 'WithExchanges', 'OnlyReplacement'],
            default: 'Normal',
            required: true,
        },
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                costPrice: { type: Number, required: true },
                tax: { type: Number, default: 0 },
                subtotal: { type: Number, required: true },
                entryType: {
                    type: String,
                    enum: ['Replacement', 'Exchange', 'Return'],
                    default: 'Replacement',
                },
                reason: { type: String },
            },
        ],
        attachments: [
            {
                name: { type: String },
                url: { type: String },
                type: { type: String },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        paidAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Partial', 'Overdue'],
            default: 'Unpaid',
            required: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        storeId: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
)

const Purchase = (models.Purchase as Model<IPurchase>) || model<IPurchase>('Purchase', purchaseSchema)

export default Purchase
