import { Schema, model, models, Document } from 'mongoose'

export interface ISubCategory extends Document {
    _id: string
    name: string
    slug: string
    parentCategory: Schema.Types.ObjectId
    code: string
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

const subCategorySchema = new Schema<ISubCategory>(
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
        parentCategory: {
            type: Schema.Types.ObjectId as any,
            ref: 'Category',
            required: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
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

subCategorySchema.index({ name: 1, industry: 1, storeId: 1, parentCategory: 1 }, { unique: true })

const SubCategory = models.SubCategory || model<ISubCategory>('SubCategory', subCategorySchema)

export default SubCategory
