import { Schema, model, models, Document } from 'mongoose'

export interface IBrand extends Document {
    _id: any
    name: string
    slug: string
    industry: string
    synonyms: string[]
    usageCount: number
    isApproved: boolean
    isGlobal: boolean
    storeId?: string
    status: boolean
    createdAt: Date
    updatedAt: Date
}

const brandSchema = new Schema<IBrand>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        industry: {
            type: String,
            required: true,
            index: true,
            default: 'general'
        },
        synonyms: {
            type: [String],
            default: []
        },
        usageCount: {
            type: Number,
            default: 0
        },
        isApproved: {
            type: Boolean,
            default: true
        },
        isGlobal: {
            type: Boolean,
            default: false
        },
        storeId: {
            type: String,
            required: false,
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

brandSchema.index({ name: 1, industry: 1, storeId: 1 }, { unique: true })

const Brand = models.Brand || model<IBrand>('Brand', brandSchema)

export default Brand
