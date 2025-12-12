import {
    Document,
    Model,
    model,
    models,
    Schema,
} from 'mongoose';

export interface ICustomer extends Document {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    storeId: string;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
    {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        storeId: { type: String, required: true, ref: 'Store' },
    },
    {
        timestamps: true,
    }
);

const Customer = (models.Customer as Model<ICustomer>) || model<ICustomer>('Customer', customerSchema);

export default Customer;
