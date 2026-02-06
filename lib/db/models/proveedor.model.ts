import { IProveedorInput } from '@/types';
import {
    Document,
    Model,
    model,
    models,
    Schema,
} from 'mongoose';

export interface IProveedor extends Document, IProveedorInput {
    _id: string;
    storeId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const proveedorSchema = new Schema<IProveedor>(
    {
        nameProvider: { type: String, required: true },
        tradeName: { type: String },
        rfc: { type: String, required: false }, // Can be saved without RFC with warning
        clave: { type: String, required: true },

        // Contact Info
        mainContact: { type: String },
        phone: { type: String, required: true },
        whatsapp: { type: String },
        email: { type: String },

        // Delivery Config
        deliveryDays: { type: [String] },
        deliveryHoursStart: { type: String },
        deliveryHoursEnd: { type: String },

        // Financial Terms
        paymentTerms: { type: String },
        earlyPaymentDiscount: { type: Number },
        creditLimit: { type: Number },
        notes: { type: String },

        // Grocery Specifics
        acceptsReturns: { type: Boolean, default: true },
        returnPolicy: { type: String },
        daysBeforeExpiration: { type: Number, default: 7 },
        typicalExchangePercentage: { type: Number, default: 10 },
        mainCategories: { type: String },

        // Fiscal Data
        fiscalAddress: { type: String },
        postalCode: { type: String },
        fiscalRegime: { type: String },

        // Documents
        documents: [{
            type: { type: String }, // 'cedula_fiscal', 'contrato', 'otro'
            name: { type: String },
            url: { type: String }
        }],

        isActive: { type: Boolean, default: true },
        storeId: { type: String },
    },
    {
        timestamps: true,
    }
);

const Proveedor = (models.Proveedor as Model<IProveedor>) || model<IProveedor>('Proveedor', proveedorSchema);

export default Proveedor;
