import { Document, Model, model, models, Schema } from 'mongoose'
import { IProductInput } from '@/types'

export interface IProduct extends Document, IProductInput {
	_id: string
	createdAt: Date
	updatedAt: Date
}

const productSchema = new Schema<IProduct>(
	{
		productId: {
			type: Number,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		slug: {
			type: String,
			required: false,
			unique: false, //cambiar a true
		},
		category: {
			type: String,
			required: true,
		},
		sku: { type: String, required: true, unique: true },
		images: [
			{
				imgUrl: { type: String, required: true },
				imgKey: { type: String, required: true }
			}
		],
		brand: {
			type: String,
			required: false,
		},
		description: {
			type: String,
			trim: true,
		},
		price: {
			type: Number,
			required: true,
		},
		listPrice: {
			type: Number,
			required: true,
		},
		discountPrice: {
			type: Number,
			required: false,
		},
		countInStock: {
			type: Number,
			required: true,
		},
		tags: { type: [String], default: ['new arrival'] },
		avgRating: {
			type: Number,
			required: false,
			default: 0,
		},
		numReviews: {
			type: Number,
			required: false,
			default: 0,
		},
		ratingDistribution: [
			{
				rating: {
					type: Number,
					required: false,
				},
				count: {
					type: Number,
					required: false,
				},
			},
		],
		numSales: {
			type: Number,
			required: true,
			default: 0,
		},
		isPublished: {
			type: Boolean,
			required: true,
			default: false,
		},
		isProductKg: {
			type: Boolean,
			required: true,
			default: true,
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review',
				default: [],
			},
		],
	},
	{
		timestamps: true,
	}
)

const Product =
	(models.Product as Model<IProduct>) ||
	model<IProduct>('Product', productSchema)

export default Product
