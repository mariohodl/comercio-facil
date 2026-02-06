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
export const ProductBaseSchema = z.object({
	_id: z.string().optional(),
	productId: z.coerce
		.number()
		.int()
		.nonnegative('Number of sales must be a non-negative number'),
	name: z.string().min(3, 'Name must be at least 3 characters'),
	slug: z.string().min(3, 'Slug must be at least 3 characters'),
	sku: z.string().min(1, 'SKU is required').regex(/^[a-zA-Z0-9-_]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores'),
	images: z.array(z.object({
		imgUrl: z.string(),
		imgKey: z.string(),
		name: z.string().optional(),
		size: z.number().optional(),
		file: z.any().optional()
	})),
	description: z.string().optional(),
	isPublished: z.boolean(),
	listPrice: z.coerce
		.number()
		.nonnegative('List price must be a non-negative number'),
	discountPrice: z.coerce
		.number()
		.nonnegative('Discount price must be a non-negative number')
		.optional(),
	countInStock: z.coerce
		.number()
		.int()
		.nonnegative('Count in stock must be a non-negative number'),
	tags: z.array(z.string()).default([]),
	avgRating: z.coerce
		.number()
		.nonnegative('Average rating must be a non-negative number'),
	numReviews: z.coerce
		.number()
		.int()
		.nonnegative('Number of reviews must be a non-negative number'),
	ratingDistribution: z
		.array(z.object({ rating: z.number(), count: z.number() }))
		.max(5),
	reviews: z.array(z.string()).default([]),
	numSales: z.coerce
		.number()
		.int()
		.nonnegative('Number of sales must be a non-negative number'),
	store: z.string().min(1, 'Store is required'),
	warehouse: z.string().min(1, 'Warehouse is required'),

	// Hybrid Catalog References (Optional for backwards compatibility)
	categoriaId: z.string().optional(),
	subCategoriaId: z.string().optional(),
	brandId: z.string().optional(),
	unitId: z.string().optional(),

	// String representations
	category: z.string().min(1, 'Category is required'),
	subCategory: z.string().min(1, 'Subcategory is required'),
	unit: z.string().min(1, 'Unit is required'),
	brand: z.string().min(1, 'Brand is required'),

	// Custom data flags
	isCustomCategory: z.boolean().optional(),
	isCustomBrand: z.boolean().optional(),

	barcodeSymbology: z.string().optional(),
	itemBarcode: z.string().optional(),
	productType: z.string().min(1, 'Product type is required'),
	taxType: z.string().optional(),
	tax: z.coerce.number().nonnegative('Tax must be a non-negative number').optional(),
	discountType: z.string().optional(),
	discountValue: z.coerce.number().optional(),
	quantityAlert: z.coerce.number().int().nonnegative('Quantity alert must be a non-negative number'),
	costPerUnit: z.coerce.number().nonnegative('Cost per unit must be a non-negative number'),
	attributes: z.array(z.object({
		name: z.string(),
		values: z.array(z.string())
	})).optional(),
	variants: z.array(z.object({
		sku: z.string(),
		costPerUnit: z.number(),
		listPrice: z.number(),
		discountPrice: z.number().optional(),
		discountType: z.string().optional(),
		discountValue: z.number().optional(),
		countInStock: z.number(),
		attributes: z.array(z.object({
			name: z.string(),
			value: z.string()
		})),
		images: z.array(z.object({
			imgUrl: z.string(),
			imgKey: z.string(),
			name: z.string().optional(),
			size: z.number().optional(),
			file: z.any().optional()
		})).max(2).optional(),
		barcode: z.string().optional(),
	})).optional(),
})

export const ProductInputSchema = ProductBaseSchema.superRefine((data, ctx) => {
	if (data.productType === 'Single Product' && (!data.itemBarcode || data.itemBarcode.trim() === '')) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Item barcode is required',
			path: ['itemBarcode'],
		})
	}
})

// Order Item
export const OrderItemSchema = z.object({
	clientId: z.string().min(1, 'clientId is required'),
	product: z.string().min(1, 'Product is required'),
	name: z.string().min(1, 'Name is required'),
	slug: z.string().min(1, 'Slug is required'),
	category: z.string().min(1, 'Category is required'),
	sku: z.string().min(1, 'SKU is required'),
	quantity: z
		.number()
		.int()
		.nonnegative('Quantity must be a non-negative number'),
	countInStock: z
		.number()
		.int()
		.nonnegative('Quantity must be a non-negative number'),
	image: z.string().min(1, 'Image is required'),
	price: z.number().nonnegative('Price must be a non-negative number'),
	color: z.string().optional(),
	size: z.string().optional(),
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
	customer: MongoId.optional(),
	fulfillmentType: z.enum(['IN_STORE', 'PICKUP_LATER', 'DELIVERY']).default('IN_STORE'),
	fulfillmentStatus: z.enum(['PENDING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED']).default('PENDING'),
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
			(value) => {
				const today = new Date();
				today.setHours(0, 0, 0, 0); // Start of today
				return value >= today;
			},
			'Expected delivery date must be today or in the future'
		),
	isDelivered: z.boolean().default(false),
	deliveredAt: z.date().optional(),
	isPaid: z.boolean().default(false),
	paidAt: z.date().optional(),
	isRounded: z.boolean().optional(),
	amountRounded: z.number().optional(),
	storeId: z.string().optional(),
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
	storeId: z.string().optional(),
})

// USER
const UserName = z
	.string()
	.min(2, { message: 'Username must be at least 2 characters' })
	.max(50, { message: 'Username must be at most 50 characters' })
const Email = z.string().min(1, 'Email is required').email('Email is invalid')
const Password = z.string().min(3, 'Password must be at least 3 characters')
const UserRole = z.string().optional()
const StoreId = z.string().optional()

export const UserInputSchema = z.object({
	name: UserName,
	email: Email,
	phone: z.string().min(1, 'Phone is required'),
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
	name: UserName,
	phone: z.string().min(1, 'Phone is required'),
	confirmPassword: Password,
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ['confirmPassword'],
})

export const StoreSettingsSchema = z.object({
	companyName: z.string().min(3, 'Company name must be at least 3 characters'),
	storeName: z.string().min(3, 'Store name must be at least 3 characters'),
	storeLocation: z.string().min(3, 'Store location must be at least 3 characters'),
	warehouseName: z.string().min(3, 'Warehouse name must be at least 3 characters'),
	warehouseLocation: z.string().min(3, 'Warehouse location must be at least 3 characters'),
	taxId: z.string().optional(),
	storeId: StoreId,
	industry: z.string().min(1, 'Industry is required'),
	plan: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']).optional(),
	planStatus: z.string().optional(),
	trialEndDate: z.string().nullable().optional(),
	subscriptionEndDate: z.string().nullable().optional(),
})

export const UserNameSchema = z.object({
	name: UserName,
})

export const ProductUpdateSchema = ProductBaseSchema.extend({
	_id: z.string().optional(),
}).superRefine((data, ctx) => {
	if (data.productType === 'Single Product' && (!data.itemBarcode || data.itemBarcode.trim() === '')) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Item barcode is required',
			path: ['itemBarcode'],
		})
	}
})

export const UserUpdateSchema = z.object({
	_id: MongoId,
	name: UserName,
	email: Email,
	role: UserRole,
})

export const StoreUserCreateSchema = z.object({
	name: UserName,
	email: Email,
	phone: z.string().min(1, 'Phone is required'),
	password: Password,
	confirmPassword: Password,
	role: z.string().min(1, 'Role is required'),
	status: z.boolean().default(true),
	storeId: z.string().min(1, 'Store ID is required'),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ['confirmPassword'],
})

export const StoreUserUpdateSchema = z.object({
	_id: MongoId,
	name: UserName,
	email: Email,
	phone: z.string().optional(),
	password: z.string().optional(),
	confirmPassword: z.string().optional(),
	role: z.string().min(1, 'Role is required'),
	status: z.boolean().default(true),
	storeId: z.string().optional(),
}).refine((data) => {
	if (data.password || data.confirmPassword) {
		return data.password === data.confirmPassword;
	}
	return true;
}, {
	message: "Passwords don't match",
	path: ['confirmPassword'],
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
	storeId: z.string().optional(),
})

export const PurchaseStatusSchema = z.enum(['Received', 'Pending', 'Ordered', 'Cancelled', 'Completed', 'WithExchanges'])
export const PaymentStatusSchema = z.enum(['Paid', 'Unpaid', 'Partial', 'Overdue'])
export const PurchaseTypeSchema = z.enum(['Normal', 'WithExchanges', 'OnlyReplacement'])
export const EntryTypeSchema = z.enum(['Replacement', 'Exchange', 'Return'])

export const PurchaseItemSchema = z.object({
	productId: MongoId,
	name: z.string(),
	quantity: z.coerce.number().positive('Quantity must be positive'),
	costPrice: z.coerce.number().nonnegative('Cost price must be non-negative'),
	tax: z.coerce.number().nonnegative('Tax must be non-negative').optional(),
	subtotal: z.coerce.number().nonnegative('Subtotal must be non-negative'),
	entryType: EntryTypeSchema.default('Replacement'),
	reason: z.string().optional(),
})

export const PurchaseAttachmentSchema = z.object({
	name: z.string(),
	url: z.string().url(),
	type: z.string(),
})

export const PurchaseInputSchema = z.object({
	supplierId: z.string().min(1, 'providerRequired').regex(/^[0-9a-fA-F]{24}$/, { message: 'providerRequired' }),
	reference: z.string().min(1, 'referenceRequired'),
	purchaseDate: z.date(),
	status: PurchaseStatusSchema,
	type: PurchaseTypeSchema.default('Normal'),
	items: z.array(PurchaseItemSchema).min(1, 'itemsRequired'),
	totalAmount: z.coerce.number().positive('amountRequired'),
	paidAmount: z.coerce.number().nonnegative().default(0),
	paymentStatus: PaymentStatusSchema,
	notes: z.string().optional(),
	storeId: z.string().optional(),
	attachments: z.array(PurchaseAttachmentSchema).optional(),
})

export const PurchaseUpdateSchema = PurchaseInputSchema.extend({
	_id: MongoId,
})

export const ProveedorInputSchema = z.object({
	// Basic Info
	nameProvider: z.string().min(1, 'El nombre es obligatorio'),
	tradeName: z.string().optional(),
	rfc: z.string().optional(), // Validated conditionally in UI
	clave: z.string().min(1, 'La clave es obligatoria'),

	// Contact Info
	mainContact: z.string().optional(),
	phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
	whatsapp: z.string().optional(),
	email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),

	// Delivery Config
	deliveryDays: z.array(z.string()).optional(),
	deliveryHoursStart: z.string().optional(),
	deliveryHoursEnd: z.string().optional(),

	// Financial Terms
	paymentTerms: z.string().optional(), // 'contado', '7_dias', etc.
	earlyPaymentDiscount: z.coerce.number().optional(),
	creditLimit: z.coerce.number().optional(),
	notes: z.string().optional(),

	// Grocery Specifics
	acceptsReturns: z.boolean().default(true),
	returnPolicy: z.string().optional(), // 'solo_cambios', 'cambios_y_devoluciones', 'no_acepta'
	daysBeforeExpiration: z.coerce.number().optional(),
	typicalExchangePercentage: z.coerce.number().optional(),
	mainCategories: z.string().optional(),

	// Fiscal Data
	fiscalAddress: z.string().optional(),
	postalCode: z.string().optional(),
	fiscalRegime: z.string().optional(),

	// Documents
	documents: z.array(z.object({
		type: z.string(),
		name: z.string(),
		url: z.string(),
	})).optional(),

	isActive: z.boolean().default(true),
	storeId: z.string().optional(),
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
	type: z.string(),
	storeId: z.string().optional(),
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
	storeId: z.string(),
	allTotalValue: z.coerce.number(),
	allSubTotalValue: z.coerce.number(),
	allProducts: z.array(ReportInputProduct),
	productsCount: z.coerce.number(),
	dateRangeFormatted: z.string(),
	dateRange: IDateRange,
	filtersUsed: z.optional(IReportInput),
	reportItems: z.array(z.unknown())
})

export const POSOrderSchema = z.object({
	items: z.array(
		z.object({
			product: z.string(),
			name: z.string(),
			slug: z.string(),
			image: z.string(),
			category: z.string(),
			price: z.number(),
			countInStock: z.number(),
			quantity: z.number().min(1),
		})
	).min(1, 'Cart is empty'),
	paymentMethod: z.enum(['Cash', 'Card', 'Split']),
	totalPrice: z.number(),
	receivedAmount: z.number().optional(), // For cash payments
	change: z.number().optional(), // For cash payments
	paymentSplits: z
		.array(
			z.object({
				method: z.enum(['Cash', 'Card']),
				amount: z.number(),
			})
		)
		.optional(),
	isRounded: z.boolean().optional(),
	amountRounded: z.number().optional(),
	isPaid: z.boolean().optional(),
	customerId: z.string().optional(),
	fulfillmentType: z.enum(['IN_STORE', 'PICKUP_LATER', 'DELIVERY']).default('IN_STORE'),
	fulfillmentStatus: z.enum(['PENDING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED']).optional(),
})

export const CategoryInputSchema = z.object({
	categoryName: z.string().min(1, 'Category name is required'),
	categorySlug: z.string().min(1, 'Category slug is required'),
	storeId: z.string().optional(),
	status: z.boolean().default(true),
})

export const CategoryUpdateSchema = CategoryInputSchema.extend({
	_id: MongoId,
})

export const SubCategoryInputSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	slug: z.string().optional(),
	parentCategory: z.string().min(1, 'Parent category is required'),
	code: z.string().optional(),
	storeId: z.string().optional(),
	status: z.boolean().default(true),
})

export const SubCategoryUpdateSchema = SubCategoryInputSchema.extend({
	_id: MongoId,
})

export const BrandInputSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	image: z.string().min(1, 'Image is required'),
	storeId: z.string().optional(),
	status: z.boolean().default(true),
})

export const BrandUpdateSchema = BrandInputSchema.extend({
	_id: MongoId,
})

export const UnitInputSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	abbreviation: z.string().min(1, 'Abbreviation is required'),
	storeId: z.string().optional(),
	status: z.boolean().default(true),
})

export const UnitUpdateSchema = UnitInputSchema.extend({
	_id: MongoId,
})

export const AttributeInputSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	values: z.array(z.string()).min(1, 'At least one value is required'),
	store: z.string().min(1, 'Store is required'),
	status: z.boolean().default(true),
})

export const AttributeUpdateSchema = AttributeInputSchema.extend({
	_id: MongoId,
})

// Cash Register
export const OpenRegisterSchema = z.object({
	openingAmount: z.coerce.number().nonnegative('Opening amount must be non-negative'),
})

export const RegisterMovementSchema = z.object({
	type: z.enum(['withdrawal', 'deposit']),
	amount: z.coerce.number().positive('Amount must be positive'),
	notes: z.string().min(1, 'Notes are required'),
})

export const CloseRegisterSchema = z.object({
	closingAmount: z.coerce.number().nonnegative('Closing amount must be non-negative'),
})
