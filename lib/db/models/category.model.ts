import { Schema, model, models, Document } from 'mongoose'

export interface ICategory extends Document {
    _id: string
    categoryName: string
    categorySlug: string
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
            unique: true,
            lowercase: true,
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

const Category = models.Category || model<ICategory>('Category', categorySchema)

export default Category
