import { env } from '@/config'

export const APP_NAME = env.NEXT_PUBLIC_APP_NAME
export const SERVER_URL =
	env.NEXT_PUBLIC_SERVER_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const SENDER_EMAIL = env.EMAIL_FROM
export const SENDER_NAME = env.NEXT_PUBLIC_APP_NAME

export const APP_URL = env.NEXT_PUBLIC_APP_URL
export const APP_DESCRIPTION = env.NEXT_PUBLIC_APP_DESCRIPTION
export const APP_SLOGAN = env.NEXT_PUBLIC_APP_SLOGAN
export const APP_PHONE = '+52 33 1286 3593'
export const APP_EMAIL = 'hola@comerciofacil.com'
export const SUPPORT_EMAIL = 'soporte@comerciofacil.com'

export const PAGE_SIZE = env.PAGE_SIZE
export const FREE_SHIPPING_MIN_PRICE = env.FREE_SHIPPING_MIN_PRICE
export const APP_COPYRIGHT =
	env.NEXT_PUBLIC_APP_COPYRIGHT ||
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

export const DEFAULT_PAYMENT_METHOD = env.DEFAULT_PAYMENT_METHOD || 'PayPal'

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

export const ROL_ADMIN = 'Admin'
export const ROL_CUSTOMER = 'Customer'
export const ROL_SELLER = 'Seller'
export const ROL_MANAGER = 'Manager'
export const ROL_SUPERVISOR = 'Supervisor'
export const ROL_SUPER_ADMIN = 'SuperAdmin'

export const USER_ROLES = ['Admin', 'Customer', 'Seller', 'Manager', 'Supervisor', 'SuperAdmin']

export const PLAN_BASIC = 'BASIC'
export const PLAN_INTERMEDIATE = 'INTERMEDIATE'
export const PLAN_ADVANCED = 'ADVANCED'
export const PLANS = [PLAN_BASIC, PLAN_INTERMEDIATE, PLAN_ADVANCED]

export const PLAN_STATUS_FREE_TRIAL = 'FREE_TRIAL'
export const PLAN_STATUS_ACTIVE = 'ACTIVE'
export const PLAN_STATUS_EXPIRED = 'EXPIRED'
export const PLAN_STATUS_CANCELLED = 'CANCELLED'
export const PLAN_STATUSES = [PLAN_STATUS_FREE_TRIAL, PLAN_STATUS_ACTIVE, PLAN_STATUS_EXPIRED, PLAN_STATUS_CANCELLED]

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

export const UPLOADTHING_TOKEN = env.NODE_ENV === 'production'
	? (env.UPLOADTHING_TOKEN_PROD || env.UPLOADTHING_TOKEN_DEV)
	: env.UPLOADTHING_TOKEN_DEV
