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
    createdAt: Date;
    updatedAt: Date;
}

const proveedorSchema = new Schema<IProveedor>(
    {
        nameProvider: { type: String, required: true },
        clave: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        rfc: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const Proveedor = (models.Proveedor as Model<IProveedor>) || model<IProveedor>('Proveedor', proveedorSchema);

export default Proveedor;
