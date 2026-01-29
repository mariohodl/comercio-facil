import { Schema, model, models, Document } from 'mongoose'

export interface ICategory extends Document {
    _id: string
    categoryName: string
    categorySlug: string
    industry: string
    synonyms: string[]
    usageCount: number
    createdBy: Schema.Types.ObjectId
    isApproved: boolean
    isGlobal: boolean
    storeId?: string
    status: boolean
    createdAt: Date
    updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true,
        },
        categorySlug: {
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
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        isApproved: {
            type: Boolean,
            default: false
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

// Ensure uniqueness within industry for global categories, or within store for private ones
categorySchema.index({ categoryName: 1, industry: 1, storeId: 1 }, { unique: true })

const Category = models.Category || model<ICategory>('Category', categorySchema)

export default Category
