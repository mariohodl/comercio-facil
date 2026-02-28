import { Document, Model, model, models, Schema } from 'mongoose';

export interface IExpense extends Document {
    amount: number;
    category: string;
    description?: string;
    date: Date;
    storeId: string;
    user: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
    {
        amount: { type: Number, required: true },
        category: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true, default: Date.now },
        storeId: { type: String, required: true, index: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

const Expense = (models.Expense as Model<IExpense>) || model<IExpense>('Expense', expenseSchema);

export default Expense;
