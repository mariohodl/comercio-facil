import { IOrderReceptionInput } from '@/types';
import {
    Document,
    Model,
    model,
    models,
    Schema,
} from 'mongoose';

export interface IOrderReception extends Document, IOrderReceptionInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderReceptionSchema = new Schema<IOrderReception>(
    {
        nameProvider: { type: String, required: true },
        clave: { type: String, required: true },
        facturaNumber: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        rfc: { type: String, required: true },
        observations: { type: String },
        isPaid: { type: Boolean, default: false, required: true },
        products: [
            {
                name: { type: String, required: true },
                productId: { type: String, required: true },
                quantity: { type: Number, required: true },
                basePrice: { type: Number, required: true },
                category: { type: String, required: true },
                isProductKg: { type: Boolean, default: false },
            },
        ],
        subtotal: { type: Number, required: true },
        total: { type: Number, required: true },
        iva: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

const OrderReception = (models.OrderReception as Model<IOrderReception>) || model<IOrderReception>('OrderReception', orderReceptionSchema);

export default OrderReception;
