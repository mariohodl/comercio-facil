import { Document, Model, model, models, Schema } from 'mongoose';

export interface IStore extends Document {
    _id: string;
    name: string;
    company: string;
    location?: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
    {
        name: { type: String, required: true },
        company: { type: Schema.Types.ObjectId as any, ref: 'Company', required: true },
        location: { type: String, default: '' },
        slug: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
    }
);

const Store = (models.Store as Model<IStore>) || model<IStore>('Store', storeSchema);

export default Store;
