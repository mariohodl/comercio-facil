import { IReportSchema } from '@/types';
import {
    Document,
    Model,
    model,
    models,
    Schema,
} from 'mongoose';

export interface IReport extends Document, IReportSchema {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
    {
        title: { type: String, required: true },
        type: { type: String, required: true },
        status: { type: String, required: true },
        allTotalValue: { type: Number, required: true },
        allSubTotalValue: { type: Number, required: true },
        allProducts: [
			{
				name: { type: String, required: true },
				productId: { type: String, required: true },
				countInStock: { type: Number, required: true },
				price: { type: Number, required: true },
				category: { type: String, required: true },
				isValidProduct: { type: Boolean, default: true},
			},
		],
        productsCount: { type: Number, required: true },
        dateRangeFormatted: { type: String, required: true },
        dateRange: {
            type: Object,
            required: false
        },
        filtersUsed: {
            type: Object,
            required: false
        },
        createdAt: { type: Date, default: Date.now },
        reportItems: []
    },
    {
        timestamps: true,
    }
);

const Report = (models.Report as Model<IReport>) || model<IReport>('Report', reportSchema);

export default Report;
