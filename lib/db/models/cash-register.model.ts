import { Document, Model, model, models, Schema } from 'mongoose';

export interface ICashRegisterMovement {
    type: 'sale' | 'withdrawal' | 'deposit';
    amount: number;
    paymentMethod?: string;
    orderId?: any; // ObjectId
    notes?: string;
    createdAt: Date;
}

export interface ICashRegisterSession extends Document {
    storeId: string; // Changed from any/ObjectId to string
    userId: any; // ObjectId
    openedAt: Date;
    closedAt?: Date;
    openingAmount: number;
    closingAmount?: number;
    status: 'open' | 'closed';
    movements: ICashRegisterMovement[];
    createdAt: Date;
    updatedAt: Date;
}

const cashRegisterSchema = new Schema<ICashRegisterSession>(
    {
        storeId: { type: String, required: true }, // Changed from ObjectId to String to support custom IDs (e.g. nanoid)
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        openedAt: { type: Date, required: true, default: Date.now },
        closedAt: { type: Date },
        openingAmount: { type: Number, required: true },
        closingAmount: { type: Number },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
        movements: [
            {
                type: { type: String, enum: ['sale', 'withdrawal', 'deposit'], required: true },
                amount: { type: Number, required: true },
                paymentMethod: { type: String },
                orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
                notes: { type: String },
                createdAt: { type: Date, default: Date.now },
            }
        ]
    },
    {
        timestamps: true,
    }
);

const CashRegisterSession = (models.CashRegisterSession as Model<ICashRegisterSession>) || model<ICashRegisterSession>('CashRegisterSession', cashRegisterSchema);

export default CashRegisterSession;
