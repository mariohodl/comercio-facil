'use server'
import { connectToDatabase } from '@/lib/db'
import Product, { IProduct } from '@/lib/db/models/product.model'
import { PAGE_SIZE } from '@/lib/constants'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { ProductInputSchema, ProductUpdateSchema } from '../validator'
import { IProductInput } from '@/types'
import { z } from 'zod'
import { utapi } from '@/app/api/uploadthing/core'

export async function getProductsByTag({
	tag,
	limit = 10,
}: {
	tag: string
	limit?: number
}) {
	await connectToDatabase()
	const products = await Product.find({
		tags: { $in: [tag] },
		isPublished: true,
	})
		.sort({ createdAt: 'desc' })
		.limit(limit)
	return JSON.parse(JSON.stringify(products)) as IProduct[]
}

export async function getAllCategories() {
	await connectToDatabase()
	const categories = await Product.find({ isPublished: true }).distinct(
		'category'
	)
	return categories
}
export async function getProductsForCard({
	tag,
	limit = 4,
}: {
	tag: string
	limit?: number
}) {
	await connectToDatabase()
	const products = await Product.find(
		{ tags: { $in: [tag] }, isPublished: true },
		{
			name: 1,
			href: { $concat: ['/product/', '$slug'] },
			image: { $arrayElemAt: ['$images', 0] },
		}
	)
		.sort({ createdAt: 'desc' })
		.limit(limit)
	return JSON.parse(JSON.stringify(products)) as {
		name: string
		href: string
		image: string
	}[]
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
	await connectToDatabase()
	const product = await Product.findOne({ slug, isPublished: true })
	if (!product) throw new Error('Product not found')
	return JSON.parse(JSON.stringify(product)) as IProduct
}
// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
	category,
	productId,
	limit = PAGE_SIZE,
	page = 1,
}: {
	category: string
	productId: string
	limit?: number
	page: number
}) {
	await connectToDatabase()
	const skipAmount = (Number(page) - 1) * limit
	const conditions = {
		isPublished: true,
		category,
		_id: { $ne: productId },
	}
	const products = await Product.find(conditions)
		.sort({ numSales: 'desc' })
		.skip(skipAmount)
		.limit(limit)
	const productsCount = await Product.countDocuments(conditions)
	return {
		data: JSON.parse(JSON.stringify(products)) as IProduct[],
		totalPages: Math.ceil(productsCount / limit),
	}
}

// GET ALL PRODUCTS
export async function getAllProducts({
	query,
	limit,
	page,
	category,
	tag,
	price,
	rating,
	sort,
}: {
	query: string
	category: string
	tag: string
	limit?: number
	page: number
	price?: string
	rating?: string
	sort?: string
}) {
	limit = limit || PAGE_SIZE
	await connectToDatabase()

	const queryFilter =
		query && query !== 'all'
			? {
				name: {
					$regex: query,
					$options: 'i',
				},
			}
			: {}
	const categoryFilter = category && category !== 'all' ? { category } : {}
	const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

	const ratingFilter =
		rating && rating !== 'all'
			? {
				avgRating: {
					$gte: Number(rating),
				},
			}
			: {}
	// 10-50
	const priceFilter =
		price && price !== 'all'
			? {
				price: {
					$gte: Number(price.split('-')[0]),
					$lte: Number(price.split('-')[1]),
				},
			}
			: {}
	const order: Record<string, 1 | -1> =
		sort === 'best-selling'
			? { numSales: -1 }
			: sort === 'price-low-to-high'
				? { price: 1 }
				: sort === 'price-high-to-low'
					? { price: -1 }
					: sort === 'avg-customer-review'
						? { avgRating: -1 }
						: { _id: -1 }
	const isPublished = { isPublished: true }
	const products = await Product.find({
		...isPublished,
		...queryFilter,
		...tagFilter,
		...categoryFilter,
		...priceFilter,
		...ratingFilter,
	})
		.sort(order)
		.skip(limit * (Number(page) - 1))
		.limit(limit)
		.lean()

	const countProducts = await Product.countDocuments({
		...queryFilter,
		...tagFilter,
		...categoryFilter,
		...priceFilter,
		...ratingFilter,
	})
	return {
		products: JSON.parse(JSON.stringify(products)) as IProduct[],
		totalPages: Math.ceil(countProducts / limit),
		totalProducts: countProducts,
		from: limit * (Number(page) - 1) + 1,
		to: limit * (Number(page) - 1) + products.length,
	}
}

export async function getAllTags() {
	const tags = await Product.aggregate([
		{ $unwind: '$tags' },
		{ $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
		{ $project: { _id: 0, uniqueTags: 1 } },
	])
	return (
		(tags[0]?.uniqueTags
			.sort((a: string, b: string) => a.localeCompare(b))
			.map((x: string) =>
				x
					.split('-')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')
			) as string[]) || []
	)
}

// DELETE
export async function deleteProduct(id: string) {
	try {
		await connectToDatabase()
		const res = await Product.findByIdAndDelete(id)
		if (!res) throw new Error('Product not found')
		revalidatePath('/admin/products')
		return {
			success: true,
			message: 'Product deleted successfully',
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

export async function getAllBrands() {
	await connectToDatabase()
	const brands = await Product.find({ isPublished: true }).distinct('brand')
	return brands
}

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin({
	query,
	page = 1,
	sort = 'latest',
	limit,
	category,
	brand,
}: {
	query: string
	page?: number
	sort?: string
	limit?: number
	category?: string
	brand?: string
}) {
	await connectToDatabase()

	const pageSize = limit || PAGE_SIZE
	const queryFilter =
		query && query !== 'all'
			? {
				name: {
					$regex: query,
					$options: 'i',
				},
			}
			: {}
	const categoryFilter = category && category !== 'all' ? { category } : {}
	const brandFilter = brand && brand !== 'all' ? { brand } : {}

	const order: Record<string, 1 | -1> =
		sort === 'best-selling'
			? { numSales: -1 }
			: sort === 'price-low-to-high'
				? { price: 1 }
				: sort === 'price-high-to-low'
					? { price: -1 }
					: sort === 'avg-customer-review'
						? { avgRating: -1 }
						: { _id: -1 }
	const products = await Product.find({
		...queryFilter,
		...categoryFilter,
		...brandFilter,
	})
		.sort(order)
		.skip(pageSize * (Number(page) - 1))
		.limit(pageSize)
		.lean()

	const countProducts = await Product.countDocuments({
		...queryFilter,
		...categoryFilter,
		...brandFilter,
	})
	return {
		products: JSON.parse(JSON.stringify(products)) as IProduct[],
		totalPages: Math.ceil(countProducts / pageSize),
		totalProducts: countProducts,
		from: pageSize * (Number(page) - 1) + 1,
		to: pageSize * (Number(page) - 1) + products.length,
	}
}
export async function getAllExistingProducts() {
	await connectToDatabase()

	const products = await Product.find().lean()
	return {
		products: JSON.parse(JSON.stringify(products)) as IProduct[],
	}
}
// CREATE
// CREATE
export async function createProduct(data: IProductInput) {
	try {
		const product = ProductInputSchema.parse(data)
		await connectToDatabase()
		await Product.create(product)
		revalidatePath('/admin/products')
		return {
			success: true,
			message: 'Product created successfully',
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
	try {
		const product = ProductUpdateSchema.parse(data)
		await connectToDatabase()
		await Product.findByIdAndUpdate(product._id, product)
		revalidatePath('/admin/products')
		return {
			success: true,
			message: 'Product updated successfully',
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}
// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
	await connectToDatabase()
	const product = await Product.findById(productId)
	return JSON.parse(JSON.stringify(product)) as IProduct
}

// Add Image url to product
export async function addProductImg(productId: string, imgUrl: string, imgKey: string) {
	await connectToDatabase()
	const product = await Product.updateOne({ _id: productId },
		{ $push: { images: { imgUrl, imgKey } } })
	return JSON.parse(JSON.stringify(product)) as IProduct
}

// Delete Image url From product
export async function deleteProductImg(productId: string, imgKey: string) {
	await connectToDatabase()
	try {
		const uatiRes = await utapi.deleteFiles(imgKey)
		console.log('UATRE', uatiRes)
		const product = await Product.updateOne({ _id: productId },
			{ $pull: { images: { imgKey } } })
		return { success: true, product: JSON.parse(JSON.stringify(product)) as IProduct }
	} catch (error) {
		return { success: false, errorMessage: 'Error deleting files', error: JSON.stringify(error) }
	}
}

//   export async function createOrUpdateManyProducts(){}
