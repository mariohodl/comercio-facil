import { z } from 'zod'
import { formatNumberWithDecimal } from './utils'

const MongoId = z
	.string()
	.regex(/^[0-9a-fA-F]{24}$/, { message: 'ID de MongoDB inválido' })

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
	title: z.string().min(1, 'El título es obligatorio'),
	comment: z.string().min(1, 'El comentario es obligatorio'),
	rating: z.coerce
		.number()
		.int()
		.min(1, 'La calificación debe ser al menos 1')
		.max(5, 'La calificación debe ser como máximo 5'),
})
export const ProductBaseSchema = z.object({
	_id: z.string().optional(),
	productId: z.coerce
		.number()
		.int()
		.nonnegative('El número de ventas debe ser un número no negativo'),
	name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
	slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres'),
	sku: z.string().min(1, 'El SKU es obligatorio').regex(/^[a-zA-Z0-9-_]+$/, 'El SKU solo puede contener letras, números, guiones y guiones bajos'),
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
		.nonnegative('El precio de lista debe ser un número no negativo'),
	discountPrice: z.coerce
		.number()
		.nonnegative('El precio de descuento debe ser un número no negativo')
		.optional(),
	countInStock: z.coerce
		.number()
		.int()
		.nonnegative('El stock debe ser un número no negativo'),
	tags: z.array(z.string()).default([]),
	avgRating: z.coerce
		.number()
		.nonnegative('La calificación promedio debe ser un número no negativo'),
	numReviews: z.coerce
		.number()
		.int()
		.nonnegative('El número de reseñas debe ser un número no negativo'),
	ratingDistribution: z
		.array(z.object({ rating: z.number(), count: z.number() }))
		.max(5),
	reviews: z.array(z.string()).default([]),
	numSales: z.coerce
		.number()
		.int()
		.nonnegative('El número de ventas debe ser un número no negativo'),
	store: z.string().min(1, 'La tienda es obligatoria'),
	warehouse: z.string().min(1, 'El almacén es obligatorio'),

	// Hybrid Catalog References (Optional for backwards compatibility)
	categoriaId: z.string().optional(),
	subCategoriaId: z.string().optional(),
	brandId: z.string().optional(),
	unitId: z.string().optional(),

	// String representations
	category: z.string().min(1, 'La categoría es obligatoria'),
	subCategory: z.string().min(1, 'La subcategoría es obligatoria'),
	unit: z.string().min(1, 'La unidad es obligatoria'),
	brand: z.string().min(1, 'La marca es obligatoria'),

	// Custom data flags
	isCustomCategory: z.boolean().optional(),
	isCustomBrand: z.boolean().optional(),

	barcodeSymbology: z.string().optional(),
	itemBarcode: z.string().optional(),
	productType: z.string().min(1, 'El tipo de producto es obligatorio'),
	taxType: z.string().optional(),
	tax: z.coerce.number().nonnegative('El impuesto debe ser un número no negativo').optional(),
	discountType: z.string().optional(),
	discountValue: z.coerce.number().optional(),
	quantityAlert: z.coerce.number().int().nonnegative('La alerta de cantidad debe ser un número no negativo'),
	costPerUnit: z.coerce.number().nonnegative('El costo por unidad debe ser un número no negativo'),
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
			message: 'El código de barras del ítem es obligatorio',
			path: ['itemBarcode'],
		})
	}

	if (data.isPublished) {
		if (data.productType === 'Single Product' && data.listPrice <= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'El precio debe ser mayor a 0 para publicar el producto',
				path: ['listPrice'],
			})
		}

		if (data.productType === 'Variable Product' && data.variants) {
			data.variants.forEach((v, idx) => {
				if (v.listPrice <= 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'El precio debe ser mayor a 0 para publicar el producto',
						path: ['variants', idx, 'listPrice'],
					})
				}
			})
		}
	}
})

// Order Item
export const OrderItemSchema = z.object({
	clientId: z.string().min(1, 'El ID del cliente es obligatorio'),
	product: z.string().min(1, 'El producto es obligatorio'),
	name: z.string().min(1, 'El nombre es obligatorio'),
	slug: z.string().min(1, 'El slug es obligatorio'),
	category: z.string().min(1, 'La categoría es obligatoria'),
	sku: z.string().min(1, 'El SKU es obligatorio'),
	quantity: z
		.number()
		.int()
		.nonnegative('Quantity must be a non-negative number'),
	countInStock: z
		.number()
		.int()
		.nonnegative('Quantity must be a non-negative number'),
	image: z.string().min(1, 'La imagen es obligatoria'),
	price: z.number().nonnegative('Price must be a non-negative number'),
	color: z.string().optional(),
	size: z.string().optional(),
})
export const ShippingAddressSchema = z.object({
	fullName: z.string().min(1, 'El nombre completo es obligatorio'),
	street: z.string().min(1, 'La dirección es obligatoria'),
	city: z.string().min(1, 'La ciudad es obligatoria'),
	postalCode: z.string().min(1, 'El código postal es obligatorio'),
	province: z.string().min(1, 'La provincia es obligatoria'),
	phone: z.string().min(1, 'El número de teléfono es obligatorio'),
	country: z.string().min(1, 'El país es obligatorio'),
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
		.min(1, 'El pedido debe contener al menos un artículo'),
	shippingAddress: ShippingAddressSchema,
	paymentMethod: z.string().min(1, 'El método de pago es obligatorio'),
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
			'La fecha de entrega esperada debe ser hoy o en el futuro'
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
		.min(1, 'El pedido debe contener al menos un artículo'),
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
const Email = z.string().min(1, 'El correo electrónico es obligatorio').email('Email is invalid')
const Password = z.string().min(3, 'Password must be at least 3 characters')
const UserRole = z.string().optional()
const StoreId = z.string().optional()

export const UserInputSchema = z.object({
	name: UserName,
	email: Email,
	phone: z.string().min(1, 'El teléfono es obligatorio'),
	image: z.string().optional(),
	emailVerified: z.boolean(),
	role: UserRole,
	password: Password,
	paymentMethod: z.string().min(1, 'El método de pago es obligatorio'),
	storeName: z.string().optional(),
	storeId: z.string().optional(),
	isStore: z.boolean(),
	address: z.object({
		fullName: z.string().min(1, 'El nombre completo es obligatorio'),
		street: z.string().min(1, 'La calle es obligatoria'),
		city: z.string().min(1, 'La ciudad es obligatoria'),
		province: z.string().min(1, 'La provincia es obligatoria'),
		postalCode: z.string().min(1, 'El código postal es obligatorio'),
		country: z.string().min(1, 'El país es obligatorio'),
		phone: z.string().min(1, 'El número de teléfono es obligatorio'),
	}),
})
export const UserSignInSchema = z.object({
	email: Email,
	password: Password,
})

export const UserSignUpSchema = UserSignInSchema.extend({
	name: UserName,
	phone: z.string().min(1, 'El teléfono es obligatorio'),
	confirmPassword: Password,
	promoCode: z.string().optional(),
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
	industry: z.string().min(1, 'La industria es obligatoria'),
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
			message: 'El código de barras del ítem es obligatorio',
			path: ['itemBarcode'],
		})
	}

	if (data.isPublished) {
		if (data.productType === 'Single Product' && data.listPrice <= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'El precio debe ser mayor a 0 para publicar el producto',
				path: ['listPrice'],
			})
		}

		if (data.productType === 'Variable Product' && data.variants) {
			data.variants.forEach((v, idx) => {
				if (v.listPrice <= 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'El precio debe ser mayor a 0 para publicar el producto',
						path: ['variants', idx, 'listPrice'],
					})
				}
			})
		}
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
	phone: z.string().min(1, 'El teléfono es obligatorio'),
	password: Password,
	confirmPassword: Password,
	role: z.string().min(1, 'El rol es obligatorio'),
	status: z.boolean().default(true),
	storeId: z.string().min(1, 'El ID de la tienda es obligatorio'),
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
	role: z.string().min(1, 'El rol es obligatorio'),
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
	name: z.string().min(1, 'El nombre es obligatorio'),
	productId: z.string().min(1, 'El ID del producto es obligatorio'),
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
	category: z.string().min(1, 'La categoría es obligatoria'),
})

export const OrderReceptionSchema = z.object({
	nameProvider: z.string().min(6, 'El nombre es obligatorio'),
	clave: z.string().min(2, 'La clave es obligatoria'),
	facturaNumber: z.string().min(1, 'El número de factura es obligatorio'),
	rfc: z.string().min(12, 'El RFC es obligatorio'),
	observations: z.string().optional(),
	isPaid: z.boolean().optional(),
	paidAt: z.date().optional(),
	subtotal: z.coerce.number().optional(),
	total: z.coerce.number().optional(),
	iva: z.coerce.number().optional(),
	products: z
		.array(IOrderReceptionProduct)
		.min(1, 'El pedido debe contener al menos un artículo'),
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
	supplierId: z.string().min(1, 'El proveedor es obligatorio').regex(/^[0-9a-fA-F]{24}$/, { message: 'El proveedor es obligatorio' }),
	reference: z.string().min(1, 'La referencia es obligatoria'),
	purchaseDate: z.date(),
	status: PurchaseStatusSchema,
	type: PurchaseTypeSchema.default('Normal'),
	items: z.array(PurchaseItemSchema).min(1, 'Se requiere al menos un artículo'),
	totalAmount: z.coerce.number().positive('El monto es obligatorio'),
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
	title: z.string().min(6, 'El título del reporte es obligatorio'),
	type: z.string().min(3, 'El tipo de reporte es obligatorio'),
	status: z.string().min(3, 'El estado del reporte es obligatorio'),
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
			quantity: z.number().positive(),
			variantSku: z.string().optional(),
			variantDetails: z.string().optional(),
		})
	).min(1, 'El carrito está vacío'),
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
	categoryName: z.string().min(1, 'El nombre de la categoría es obligatorio'),
	categorySlug: z.string().min(1, 'El slug de la categoría es obligatorio'),
	storeId: z.string().optional(),
	status: z.boolean().default(true),
})

export const CategoryUpdateSchema = CategoryInputSchema.extend({
	_id: MongoId,
})

export const SubCategoryInputSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	slug: z.string().optional(),
	parentCategory: z.string().min(1, 'La categoría padre es obligatoria'),
	code: z.string().optional(),
	storeId: z.string().optional(),
	status: z.boolean().default(true),
})

export const SubCategoryUpdateSchema = SubCategoryInputSchema.extend({
	_id: MongoId,
})

export const BrandInputSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	storeId: z.string().optional(),
	status: z.boolean().default(true),
})

export const BrandUpdateSchema = BrandInputSchema.extend({
	_id: MongoId,
})

export const UnitInputSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	abbreviation: z.string().min(1, 'La abreviatura es obligatoria'),
	storeId: z.string().optional(),
	status: z.boolean().default(true),
})

export const UnitUpdateSchema = UnitInputSchema.extend({
	_id: MongoId,
})

export const AttributeInputSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	values: z.array(z.string()).min(1, 'Se requiere al menos un valor'),
	storeId: z.string().optional(),
	isGlobal: z.boolean().optional(),
	isApproved: z.boolean().optional(),
	industry: z.string().optional(),
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
