import { Schema, model, models, Document } from 'mongoose'

export interface IUnit extends Document {
    _id: string
    name: string
    abbreviation: string
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

const unitSchema = new Schema<IUnit>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        abbreviation: {
            type: String,
            required: true,
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

unitSchema.index({ name: 1, industry: 1, storeId: 1 }, { unique: true })

const Unit = models.Unit || model<IUnit>('Unit', unitSchema)

export default Unit
