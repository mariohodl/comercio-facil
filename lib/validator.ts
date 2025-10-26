import { z } from 'zod'
import { formatNumberWithDecimal } from './utils'

const MongoId = z
	.string()
	.regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid MongoDB ID' })

// Common
const Price = (field: string) =>
	z.coerce
		.number()
		.refine(
			(value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
			`${field} must have exactly two decimal places (e.g., 49.99)`
		)

export const ReviewInputSchema = z.object({
	product: MongoId,
	user: MongoId,
	isVerifiedPurchase: z.boolean(),
	title: z.string().min(1, 'Title is required'),
	comment: z.string().min(1, 'Comment is required'),
	rating: z.coerce
		.number()
		.int()
		.min(1, 'Rating must be at least 1')
		.max(5, 'Rating must be at most 5'),
})
export const ProductInputSchema = z.object({
	productId: z.coerce
		.number()
		.int()
		.nonnegative('Number of sales must be a non-negative number'),
	name: z.string().min(3, 'Name must be at least 3 characters'),
	slug: z.string().min(3, 'Slug must be at least 3 characters'),
	category: z.string().min(1, 'Category is required'),
	images: z.array(z.object({ imgUrl: z.string(), imgKey: z.string() })),
	brand: z.string().optional(),
	description: z.string().optional(),
	isPublished: z.boolean(),
	isProductKg: z.boolean(),
	price: Price('Price'),
	listPrice: Price('List price'), //precio del proveedor
	discountPrice: Price('Precio con descuento'),
	countInStock: z.coerce
		.number()
		.int()
		.nonnegative('count in stock must be a non-negative number'),
	tags: z.array(z.string()).default([]),
	avgRating: z.coerce
		.number()
		.min(0, 'Average rating must be at least 0')
		.max(5, 'Average rating must be at most 5'),
	numReviews: z.coerce
		.number()
		.int()
		.nonnegative('Number of reviews must be a non-negative number'),
	ratingDistribution: z
		.array(z.object({ rating: z.number(), count: z.number() }))
		.max(5),
	reviews: z.array(ReviewInputSchema).default([]),
	numSales: z.coerce
		.number()
		.int()
		.nonnegative('Number of sales must be a non-negative number'),
})

// Order Item
export const OrderItemSchema = z.object({
	clientId: z.string().min(1, 'clientId is required'),
	product: z.string().min(1, 'Product is required'),
	name: z.string().min(1, 'Name is required'),
	slug: z.string().min(1, 'Slug is required'),
	category: z.string().min(1, 'Category is required'),
	quantity: z
		.number()
		.int()
		.nonnegative('Quantity must be a non-negative number'),
	countInStock: z
		.number()
		.int()
		.nonnegative('Quantity must be a non-negative number'),
	image: z.string().min(1, 'Image is required'),
	price: Price('Price'),
	size: z.string().optional(),
	color: z.string().optional(),
})
export const ShippingAddressSchema = z.object({
	fullName: z.string().min(1, 'Full name is required'),
	street: z.string().min(1, 'Address is required'),
	city: z.string().min(1, 'City is required'),
	postalCode: z.string().min(1, 'Postal code is required'),
	province: z.string().min(1, 'Province is required'),
	phone: z.string().min(1, 'Phone number is required'),
	country: z.string().min(1, 'Country is required'),
})

export const OrderInputSchema = z.object({
	user: z.union([
		MongoId,
		z.object({
			name: z.string(),
			email: z.string().email(),
		}),
	]),
	items: z
		.array(OrderItemSchema)
		.min(1, 'Order must contain at least one item'),
	shippingAddress: ShippingAddressSchema,
	paymentMethod: z.string().min(1, 'Payment method is required'),
	paymentResult: z
		.object({
			id: z.string(),
			status: z.string(),
			email_address: z.string(),
			pricePaid: z.string(),
		})
		.optional(),
	itemsPrice: Price('Items price'),
	shippingPrice: Price('Shipping price'),
	taxPrice: Price('Tax price'),
	totalPrice: Price('Total price'),
	expectedDeliveryDate: z
		.date()
		.refine(
			(value) => value > new Date(),
			'Expected delivery date must be in the future'
		),
	isDelivered: z.boolean().default(false),
	deliveredAt: z.date().optional(),
	isPaid: z.boolean().default(false),
	paidAt: z.date().optional(),
})

export const CartSchema = z.object({
	items: z
		.array(OrderItemSchema)
		.min(1, 'Order must contain at least one item'),
	itemsPrice: z.number(),

	taxPrice: z.optional(z.number()),
	shippingPrice: z.optional(z.number()),
	shippingAddress: z.optional(ShippingAddressSchema),
	totalPrice: z.number(),
	paymentMethod: z.optional(z.string()),
	deliveryDateIndex: z.optional(z.number()),
	expectedDeliveryDate: z.optional(z.date()),
})

// USER
const UserName = z
	.string()
	.min(2, { message: 'Username must be at least 2 characters' })
	.max(50, { message: 'Username must be at most 30 characters' })
const Email = z.string().min(1, 'Email is required').email('Email is invalid')
const Password = z.string().min(3, 'Password must be at least 3 characters')
const UserRole = z.string().optional()
const IsStore = z.boolean()
const StoreName = z.string()
const StoreId = z.string().optional()

export const UserInputSchema = z.object({
	name: UserName,
	email: Email,
	image: z.string().optional(),
	emailVerified: z.boolean(),
	role: UserRole,
	password: Password,
	paymentMethod: z.string().min(1, 'Payment method is required'),
	storeName: z.string().optional(),
	storeId: z.string().optional(),
	isStore: z.boolean(),
	address: z.object({
		fullName: z.string().min(1, 'Full name is required'),
		street: z.string().min(1, 'Street is required'),
		city: z.string().min(1, 'City is required'),
		province: z.string().min(1, 'Province is required'),
		postalCode: z.string().min(1, 'Postal code is required'),
		country: z.string().min(1, 'Country is required'),
		phone: z.string().min(1, 'Phone number is required'),
	}),
})
export const UserSignInSchema = z.object({
	email: Email,
	password: Password,
})

export const UserSignUpSchema = UserSignInSchema.extend({
	isStore: IsStore,
	storeName: StoreName,
	storeId: StoreId,
	role: UserRole,
	name: UserName,
	confirmPassword: Password,
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ['confirmPassword'],
})

export const UserNameSchema = z.object({
	name: UserName,
})

export const ProductUpdateSchema = ProductInputSchema.extend({
	_id: z.string(),
})

export const UserUpdateSchema = z.object({
	_id: MongoId,
	name: UserName,
	email: Email,
	role: UserRole,
})

export const IOrderReceptionProduct = z.object({
	name: z.string().min(1, 'Name is required'),
	productId: z.string().min(1, 'Product ID is required'),
	countInStock: z.coerce
		.number()
		.int()
		.nonnegative('Quantity must be a non-negative number'),
	listPrice: z.coerce
		.number()
		.refine(
			(value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
			'Price must have exactly two decimal places (e.g., 49.99)'
		),
	category: z.string().min(1, 'Category is required'),
	isProductKg: z.boolean(),
})

export const OrderReceptionSchema = z.object({
	nameProvider: z.string().min(6, 'Name is required'),
	clave: z.string().min(2, 'Clave is required'),
	facturaNumber: z.string().min(1, 'Factura number is required'),
	rfc: z.string().min(12, 'RFC is required'),
	observations: z.string().optional(),
	isPaid: z.boolean().optional(),
	paidAt: z.date().optional(),
	subtotal: z.coerce.number().optional(),
	total: z.coerce.number().optional(),
	iva: z.coerce.number().optional(),
	products: z
		.array(IOrderReceptionProduct)
		.min(1, 'Order must contain at least one item'),
})

export const ProveedorInputSchema = z.object({
	nameProvider: z.string().min(6, 'Name is required'),
	clave: z.string().min(2, 'Clave is required'),
	rfc: z.string().min(12, 'RFC is required'),
})

export const IDateRange = z.object({
	from: z.date()
	.refine(
		(value) => value < new Date(),
		'La fecha esperada debe ser una fecha del pasado'
	),
	to: z.date()
	.refine(
		(value) => value > new Date(),
		'La fecha esperada debe ser una fecha del futuro'
	),
})

export const IReportInput = z.object({
	title: z.string().min(5, 'Nombre es requerido con almenos 5 caracters'),
	status: z.string(),
	type:  z.string(),
	dateRange: z.object({
		from: z.date()
		.refine(
			(value) => value < new Date(),
			'La fecha esperada debe ser una fecha del pasado'
		),
		to: z.date()
		.refine(
			(value) => value > new Date(),
			'La fecha esperada debe ser una fecha del futuro'
		),
	})
})

export const ReportInputProduct = z.object({
	name: z.string(),
	productId: MongoId || z.string(),
	countInStock: z.coerce.number(),
	price: z.coerce.number(),
	category: z.string(),
	isValidProduct: z.boolean().optional(),
})

export const ReportInputSchema = z.object({
	title: z.string().min(6, 'Title report is required'),
	type: z.string().min(3, 'Type of report is required'),
	status: z.string().min(3, 'Status of report is required'),
	allTotalValue: z.coerce.number(),
	allSubTotalValue: z.coerce.number(),
	allProducts: z.array(ReportInputProduct),
	productsCount: z.coerce.number(),
	dateRangeFormatted: z.string(),
	dateRange: IDateRange,
	filtersUsed: z.optional(IReportInput),
	reportItems: z.array(z.unknown())
})