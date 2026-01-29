import { Document, Model, model, models, Schema } from 'mongoose';
import {
    PLAN_BASIC, PLANS,
    PLAN_STATUS_FREE_TRIAL, PLAN_STATUSES
} from '@/lib/constants';

export interface ICompany extends Document {
    _id: string;
    name: string;
    logo?: string;
    logoUpdateHistory?: Date[];
    settings: Record<string, any>;
    owner: string;
    // Billing fields
    plan: typeof PLAN_BASIC | 'INTERMEDIATE' | 'ADVANCED';
    planStatus: typeof PLAN_STATUS_FREE_TRIAL | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    trialStartDate?: Date;
    trialEndDate?: Date;
    subscriptionEndDate?: Date;
    freeMonths: number;
    industry: string;
    taxId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
    {
        name: { type: String, required: true },
        industry: { type: String, default: 'general', index: true },
        logo: { type: String },
        logoUpdateHistory: { type: [Date], default: [] },
        taxId: { type: String },
        settings: { type: Object, default: {} },
        owner: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
        // Billing fields
        plan: {
            type: String,
            enum: PLANS,
            default: PLAN_BASIC
        },
        planStatus: {
            type: String,
            enum: PLAN_STATUSES,
            default: PLAN_STATUS_FREE_TRIAL
        },
        trialStartDate: { type: Date },
        trialEndDate: { type: Date },
        subscriptionEndDate: { type: Date },
        freeMonths: { type: Number, default: 1 }
    },
    {
        timestamps: true,
    }
);

const Company = (models.Company as Model<ICompany>) || model<ICompany>('Company', companySchema);

export default Company;
