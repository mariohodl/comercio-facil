import { Schema, model, models, Document } from 'mongoose'

export interface ISubCategory extends Document {
    _id: string
    name: string
    slug: string
    parentCategory: string // ObjectId
    code: string
    description?: string
    image?: string
    storeId: string
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
        storeId: {
            type: String,
            required: true,
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
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
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

const SubCategory = models.SubCategory || model<ISubCategory>('SubCategory', subCategorySchema)

export default SubCategory
