import { Document, Model, model, models, Schema } from 'mongoose';

export interface ICompany extends Document {
    _id: string;
    name: string;
    settings: Record<string, any>;
    owner: string;
    createdAt: Date;
    updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
    {
        name: { type: String, required: true },
        settings: { type: Object, default: {} },
        owner: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

const Company = (models.Company as Model<ICompany>) || model<ICompany>('Company', companySchema);

export default Company;
