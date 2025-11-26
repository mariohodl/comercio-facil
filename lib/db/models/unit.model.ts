import { Schema, model, models, Document } from 'mongoose'

export interface IUnit extends Document {
    _id: string
    name: string
    abbreviation: string
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
            unique: true,
        },
        abbreviation: {
            type: String,
            required: true,
            trim: true,
            unique: true,
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

const Unit = models.Unit || model<IUnit>('Unit', unitSchema)

export default Unit
