import { Schema, model, models, Document } from 'mongoose'

export interface IIndustry extends Document {
    _id: string
    name: string
    slug: string
    isApproved: boolean
    isGlobal: boolean
    createdBy?: Schema.Types.ObjectId
    usageCount: number
    status: boolean
    createdAt: Date
    updatedAt: Date
}

const industrySchema = new Schema<IIndustry>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        isGlobal: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        usageCount: {
            type: Number,
            default: 0
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)

const Industry = models.Industry || model<IIndustry>('Industry', industrySchema)

export default Industry
