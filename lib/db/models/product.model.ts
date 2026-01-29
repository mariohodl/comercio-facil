import { Document, Model, model, models, Schema } from 'mongoose'
import { IProductInput } from '@/types'

export interface IProduct extends Document, IProductInput {
	_id: string
	createdAt: Date
	updatedAt: Date
}

const variantImageSchema = new Schema(
	{
		imgUrl: { type: String, required: false },
		imgKey: { type: String, required: false }
	},
	{ _id: false }
)

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
		sku: { type: String, required: true, unique: true },
		images: [
			{
				imgUrl: { type: String, required: true },
				imgKey: { type: String, required: true }
			}
		],
		description: {
			type: String,
			trim: true,
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
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review',
				default: [],
			},
		],
		store: { type: String, required: true },
		warehouse: { type: String, required: true },

		// References to Hybrid Catalog
		categoriaId: { type: Schema.Types.ObjectId, ref: 'Category' },
		subCategoriaId: { type: Schema.Types.ObjectId, ref: 'SubCategory' },
		brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
		unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },

		// Backwards compatibility / Custom strings
		category: { type: String, required: true },
		subCategory: { type: String, required: true },
		brand: { type: String, required: false },
		unit: { type: String, required: true },

		// Flag to identify if it's using custom data
		isCustomCategory: { type: Boolean, default: false },
		isCustomBrand: { type: Boolean, default: false },

		barcodeSymbology: { type: String, required: true },
		itemBarcode: { type: String, required: false },
		productType: { type: String, required: true },
		taxType: { type: String, required: true },
		tax: { type: Number, required: true },
		discountType: { type: String, required: false },
		discountValue: { type: Number, required: false },
		quantityAlert: { type: Number, required: true },
		costPerUnit: { type: Number, required: true, default: 0 },
		attributes: [
			{
				name: { type: String },
				values: { type: [String] }
			}
		],
		variants: [
			{
				sku: { type: String, required: true },
				costPerUnit: { type: Number, required: true },
				listPrice: { type: Number, required: true },
				discountPrice: { type: Number, required: false },
				discountType: { type: String, required: false },
				discountValue: { type: Number, required: false },
				countInStock: { type: Number, required: true },
				attributes: [
					{
						name: { type: String, required: true },
						value: { type: String, required: true }
					}
				],
				images: [variantImageSchema],
				barcode: { type: String, required: false },
				taxType: { type: String, required: false },
				tax: { type: Number, required: false },
			}
		]
	},
	{
		timestamps: true,
	}
)


const Product =
	(models.Product as Model<IProduct>) ||
	model<IProduct>('Product', productSchema)

export default Product
