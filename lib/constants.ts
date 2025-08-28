export const APP_NAME = process.env.APP_NAME || 'Master Karne'
export const SERVER_URL =
	process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev'
export const SENDER_NAME = process.env.SENDER_NAME || APP_NAME

export const APP_URL = process.env.APP_URL || 'http://localhost:3000'
export const APP_DESCRIPTION =
	process.env.APP_DESCRIPTION ||
	'Distribuidor de carnes de occidente, el privilegio de..'
export const APP_SLOGAN = process.env.APP_SLOGAN || 'Come mas, gasta menos'

export const PAGE_SIZE = Number(process.env.PAGE_SIZE || 9)

export const FREE_SHIPPING_MIN_PRICE = Number(
	process.env.FREE_SHIPPING_MIN_PRICE || 35
)

export const APP_COPYRIGHT =
	process.env.NEXT_PUBLIC_APP_COPYRIGHT ||
	`Copyright © 2025 ${APP_NAME}. Todos los derechos reservados.`

export const AVAILABLE_PAYMENT_METHODS = [
	{
		name: 'PayPal',
		commission: 0,
		isDefault: true,
	},
	{
		name: 'Stripe',
		commission: 0,
		isDefault: true,
	},
	{
		name: 'Cash On Delivery',
		commission: 0,
		isDefault: true,
	},
]

export const DEFAULT_PAYMENT_METHOD =
	process.env.DEFAULT_PAYMENT_METHOD || 'PayPal'

export const AVAILABLE_DELIVERY_DATES = [
	{
		name: 'Tomorrow',
		daysToDeliver: 1,
		shippingPrice: 12.9,
		freeShippingMinPrice: 0,
	},
	{
		name: 'Next 3 Days',
		daysToDeliver: 3,
		shippingPrice: 6.9,
		freeShippingMinPrice: 0,
	},
	{
		name: 'Next 5 Days',
		daysToDeliver: 5,
		shippingPrice: 4.9,
		freeShippingMinPrice: 35,
	},
]

export const USER_ROLES = ['Admin', 'User', 'Customer', 'Seller']
export const ROL_ADMIN = 'Admin'
export const ROL_USER = 'User'
export const ROL_CUSTOMER = 'Customer'
export const ROL_SELLER = 'Seller'
export const ROL_SUPER_ADMIN = 'SuperAdmin'
export const ROL_RECEPTOR = 'Receptor'

export const AVAILABLE_CATEGORIES = [
	{
		id: 'res',
		name: 'Carne de Res',
		description: 'Cortes premium de carne de res',
		icon: 'beef',
	},
	{
		id: 'cerdo',
		name: 'Cerdo',
		description: 'Variedad de cortes de cerdo',
		icon: 'bacon',
	},
	{
		id: 'pollo',
		name: 'Pollo',
		description: 'Pollo fresco y sus partes',
		icon: 'drumstick',
	},
	{
		id: 'cordero',
		name: 'Cordero',
		description: 'Especialidad en cordero y borrego',
		icon: 'wheat',
	},
	{
		id: 'embutidos',
		name: 'Embutidos',
		description: 'Salchichas, jamones y chorizos',
		icon: 'scissors',
	},
	{
		id: 'cortes-especiales',
		name: 'Cortes Especiales',
		description: 'Cortes premium y de exportación',
		icon: 'medal',
	},
	{
		id: 'visceras',
		name: 'Vísceras',
		description: 'Órganos y menudencias selectas',
		icon: 'heart',
	},
	{
		id: 'carnes-procesadas',
		name: 'Carnes Procesadas',
		description: 'Carnes ahumadas y preparadas',
		icon: 'sparkles',
	},
	{
		id: 'carnes-marinadas',
		name: 'Carnes Marinadas',
		description: 'Carnes listas para cocinar',
		icon: 'utensils',
	},
	{
		id: 'carnes-molidas',
		name: 'Carnes Molidas',
		description: 'Diferentes tipos de carne molida',
		icon: 'scissors',
	},
	{
		id: 'aves-especiales',
		name: 'Aves Especiales',
		description: 'Pavo, pato y otras aves',
		icon: 'bird',
	},
	{
		id: 'adobados',
		name: 'Adobados',
		description: 'Carnes con adobo especial de la casa',
		icon: 'flame',
	},
]

export const TAX_RATE = 0.16 as number
