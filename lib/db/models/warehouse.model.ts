import { Document, Model, model, models, Schema } from 'mongoose';

export interface IWarehouse extends Document {
    _id: string;
    name: string;
    company: string;
    location: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
    {
        name: { type: String, required: true },
        company: { type: Schema.Types.ObjectId as any, ref: 'Company', required: true },
        location: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
    }
);

const Warehouse = (models.Warehouse as Model<IWarehouse>) || model<IWarehouse>('Warehouse', warehouseSchema);

export default Warehouse;
