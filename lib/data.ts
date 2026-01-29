import { Data, IProductInput, IUserInput } from '@/types'
import { ICustomer } from '@/lib/db/models/customer.model'
import { toSlug } from './utils'
import bcrypt from 'bcryptjs'

const uniqueStoreId = '7jDf45ff'
const uniqueStoreName = 'Mi super tiendita'

const categories = [
	{ categoryName: 'Materiales', categorySlug: 'materiales', status: true },
	{ categoryName: 'Herramientas', categorySlug: 'herramientas', status: true },
	{ categoryName: 'Equipo', categorySlug: 'equipo', status: true },
	{ categoryName: 'Electricidad', categorySlug: 'electricidad', status: true },
	{ categoryName: 'Plomería', categorySlug: 'plomeria', status: true },
	{ categoryName: 'Pintura', categorySlug: 'pintura', status: true },
	{ categoryName: 'Ferretería', categorySlug: 'ferreteria', status: true },
	{ categoryName: 'Construcción', categorySlug: 'construccion', status: true },
];

const subCategories = [
	// Materiales
	{ name: 'Cemento', slug: 'cemento', parentCategory: 'Materiales', code: 'MAT-CEM', description: 'Todo tipo de cementos', status: true },
	{ name: 'Arena', slug: 'arena', parentCategory: 'Materiales', code: 'MAT-ARE', description: 'Arena para construcción', status: true },
	{ name: 'Grava', slug: 'grava', parentCategory: 'Materiales', code: 'MAT-GRA', description: 'Grava de diferentes tamaños', status: true },
	// Herramientas
	{ name: 'Manuales', slug: 'manuales', parentCategory: 'Herramientas', code: 'HER-MAN', description: 'Herramientas de mano', status: true },
	{ name: 'Eléctricas', slug: 'electricas', parentCategory: 'Herramientas', code: 'HER-ELE', description: 'Herramientas eléctricas', status: true },
	// Equipo
	{ name: 'Seguridad', slug: 'seguridad', parentCategory: 'Equipo', code: 'EQP-SEG', description: 'Equipo de protección personal', status: true },
	{ name: 'Pesado', slug: 'pesado', parentCategory: 'Equipo', code: 'EQP-PES', description: 'Maquinaria pesada', status: true },
	// Electricidad
	{ name: 'Cables', slug: 'cables', parentCategory: 'Electricidad', code: 'ELE-CAB', description: 'Cables y alambres eléctricos', status: true },
	{ name: 'Iluminación', slug: 'iluminacion', parentCategory: 'Electricidad', code: 'ELE-ILU', description: 'Focos y lámparas', status: true },
	// Plomería
	{ name: 'Tubería', slug: 'tuberia', parentCategory: 'Plomería', code: 'PLO-TUB', description: 'Tubos y conexiones', status: true },
	{ name: 'Grifería', slug: 'griferia', parentCategory: 'Plomería', code: 'PLO-GRI', description: 'Llaves y mezcladoras', status: true },
	// Pintura
	{ name: 'Vinílica', slug: 'vinilica', parentCategory: 'Pintura', code: 'PIN-VIN', description: 'Pinturas a base de agua', status: true },
	{ name: 'Esmalte', slug: 'esmalte', parentCategory: 'Pintura', code: 'PIN-ESM', description: 'Pinturas a base de aceite', status: true },
	// Ferretería
	{ name: 'Tornillería', slug: 'tornilleria', parentCategory: 'Ferretería', code: 'FER-TOR', description: 'Tornillos, tuercas y rondanas', status: true },
	{ name: 'Cerraduras', slug: 'cerraduras', parentCategory: 'Ferretería', code: 'FER-CER', description: 'Chapas y candados', status: true },
	// Construcción
	{ name: 'Acabados', slug: 'acabados', parentCategory: 'Construcción', code: 'CON-ACA', description: 'Pisos y azulejos', status: true },
	{ name: 'Estructural', slug: 'estructural', parentCategory: 'Construcción', code: 'CON-EST', description: 'Vigas y castillos', status: true },
];

const brands = [
	{ name: 'Cemex', image: 'https://logo.clearbit.com/cemex.com', status: true },
	{ name: 'Tecnolite', image: 'https://logo.clearbit.com/tecnolite.com', status: true },
	{ name: 'Pretul', image: 'https://seeklogo.com/images/P/pretul-logo-48F6F3F3F3-seeklogo.com.png', status: true },
	{ name: 'Urrea', image: 'https://logo.clearbit.com/urrea.com', status: true },
	{ name: 'Calidra', image: 'https://logo.clearbit.com/calidra.com', status: true },
	{ name: 'Truper', image: 'https://logo.clearbit.com/truper.com', status: true },
	{ name: 'Stanley', image: 'https://static.cdnlogo.com/logos/s/25/stanley.svg', status: true },
	{ name: 'Cuprum', image: 'https://logo.clearbit.com/escalerascuprum.com', status: true },
	{ name: 'DeWalt', image: 'https://static.cdnlogo.com/logos/d/72/dewalt.svg', status: true },
	{ name: 'Makita', image: 'https://static.cdnlogo.com/logos/m/96/makita.svg', status: true },
	{ name: 'Generico', image: 'https://placehold.co/200x200.png?text=Generico', status: true },
];

const units = [
	{ name: 'Piece', abbreviation: 'Pza', status: true },
	{ name: 'Kilogram', abbreviation: 'Kg', status: true },
	{ name: 'Meter', abbreviation: 'm', status: true },
	{ name: 'Square Meter', abbreviation: 'm2', status: true },
	{ name: 'Cubic Meter', abbreviation: 'm3', status: true },
	{ name: 'Liter', abbreviation: 'L', status: true },
	{ name: 'Box', abbreviation: 'Box', status: true },
	{ name: 'Set', abbreviation: 'Set', status: true },
];

const users: IUserInput[] = [
	{
		name: 'Robe',
		email: 'robe@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Seller',
		storeName: uniqueStoreName,
		storeId: uniqueStoreId,
		isStore: false,
		address: {
			fullName: 'Roberto García',
			street: 'Juan Manuel 1249',
			city: 'Guadalajara',
			province: 'Jal',
			postalCode: '64200',
			country: 'MX',
			phone: '123-456-7890',
		},
		paymentMethod: 'Stripe',
		emailVerified: false,
		phone: '123-456-7890',
	},
	{
		name: 'Mario SuperAdmin',
		email: 'mariosuperadmin@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'SuperAdmin',
		storeName: '',
		storeId: '',
		isStore: false,
		address: {
			fullName: 'Mario López',
			street: 'Manuel M. Dieguez 900',
			city: 'Guadalajara',
			province: 'Jal',
			postalCode: '64610',
			country: 'MX',
			phone: '123-456-7890',
		},
		paymentMethod: 'Cash On Delivery',
		emailVerified: false,
		phone: '123-456-7890',
	},
	{
		name: 'Mario',
		email: 'mario@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Admin',
		storeName: uniqueStoreName,
		storeId: uniqueStoreId,
		isStore: true,
		address: {
			fullName: 'Mario López',
			street: 'Manuel M. Dieguez 900',
			city: 'Guadalajara',
			province: 'Jal',
			postalCode: '64610',
			country: 'MX',
			phone: '123-456-7890',
		},
		paymentMethod: 'Cash On Delivery',
		emailVerified: false,
		phone: '123-456-7890',
	},
	{
		name: 'Jack',
		email: 'jack@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Seller',
		storeName: uniqueStoreName,
		storeId: uniqueStoreId,
		isStore: false,
		address: {
			fullName: 'Jack Ryan',
			street: '333 Main St',
			city: 'New York',
			province: 'NY',
			postalCode: '1003',
			country: 'USA',
			phone: '123-456-7890',
		},
		paymentMethod: 'PayPal',
		emailVerified: false,
		phone: '123-456-7890',
	},
	{
		name: 'Ana',
		email: 'ana@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Admin',
		storeName: 'Materiales La Roca',
		storeId: 'la-roca-1',
		isStore: true,
		address: {
			fullName: 'Ana Martínez',
			street: 'Av. Vallarta 500',
			city: 'Guadalajara',
			province: 'Jal',
			postalCode: '44100',
			country: 'MX',
			phone: '331-234-5678',
		},
		paymentMethod: 'Stripe',
		emailVerified: true,
		phone: '331-234-5678',
	},
	{
		name: 'Pedro',
		email: 'pedro@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Seller',
		storeName: 'Materiales La Roca',
		storeId: 'la-roca-1',
		isStore: false,
		address: {
			fullName: 'Pedro Paramo',
			street: 'Calle Comala 12',
			city: 'Guadalajara',
			province: 'Jal',
			postalCode: '44100',
			country: 'MX',
			phone: '331-876-5432',
		},
		paymentMethod: 'Cash On Delivery',
		emailVerified: true,
		phone: '331-876-5432',
	},
	{
		name: 'Luis',
		email: 'luis@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Admin',
		storeName: 'Construcción Alpha',
		storeId: 'alpha-corp',
		isStore: true,
		address: {
			fullName: 'Luis Herrera',
			street: 'Paseo de la Reforma 200',
			city: 'Ciudad de México',
			province: 'CDMX',
			postalCode: '06500',
			country: 'MX',
			phone: '555-111-2222',
		},
		paymentMethod: 'Stripe',
		emailVerified: true,
		phone: '555-111-2222',
	},
	{
		name: 'Elena',
		email: 'elena@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Seller',
		storeName: 'Construcción Alpha',
		storeId: 'alpha-corp',
		isStore: false,
		address: {
			fullName: 'Elena Garro',
			street: 'Calle de los Recuerdos 45',
			city: 'Cuernavaca',
			province: 'Mor',
			postalCode: '62000',
			country: 'MX',
			phone: '777-333-4444',
		},
		paymentMethod: 'PayPal',
		emailVerified: true,
		phone: '777-333-4444',
	}
]

const reviews = [
	{
		rating: 1,
		title: 'Poor quality',
		comment:
			'Very disappointed. The item broke after just a few uses. Not worth the money.',
	},
	{
		rating: 2,
		title: 'Disappointed',
		comment:
			"Not as expected. The material feels cheap, and it didn't fit well. Wouldn't buy again.",
	},
	{
		rating: 2,
		title: 'Needs improvement',
		comment:
			"It looks nice but doesn't perform as expected. Wouldn't recommend without upgrades.",
	},
	{
		rating: 3,
		title: 'not bad',
		comment:
			'This product is decent, the quality is good but it could use some improvements in the details.',
	},
	{
		rating: 3,
		title: 'Okay, not great',
		comment:
			'It works, but not as well as I hoped. Quality is average and lacks some finishing.',
	},
	{
		rating: 3,
		title: 'Good product',
		comment:
			'This product is amazing, I love it! The quality is top notch, the material is comfortable and breathable.',
	},
	{
		rating: 4,
		title: 'Pretty good',
		comment:
			"Solid product! Great value for the price, but there's room for minor improvements.",
	},
	{
		rating: 4,
		title: 'Very satisfied',
		comment:
			'Good product! High quality and worth the price. Would consider buying again.',
	},
	{
		rating: 4,
		title: 'Absolutely love it!',
		comment:
			'Perfect in every way! The quality, design, and comfort exceeded all my expectations.',
	},
	{
		rating: 4,
		title: 'Exceeded expectations!',
		comment:
			'Fantastic product! High quality, feels durable, and performs well. Highly recommend!',
	},
	{
		rating: 5,
		title: 'Perfect purchase!',
		comment:
			"Couldn't be happier with this product. The quality is excellent, and it works flawlessly!",
	},
	{
		rating: 5,
		title: 'Highly recommend',
		comment:
			"Amazing product! Worth every penny, great design, and feels premium. I'm very satisfied.",
	},
	{
		rating: 5,
		title: 'Just what I needed',
		comment:
			'Exactly as described! Quality exceeded my expectations, and it arrived quickly.',
	},
	{
		rating: 5,
		title: 'Excellent choice!',
		comment:
			'This product is outstanding! Everything about it feels top-notch, from material to functionality.',
	},
	{
		rating: 5,
		title: "Couldn't ask for more!",
		comment:
			"Love this product! It's durable, stylish, and works great. Would buy again without hesitation.",
	},
]

const products: IProductInput[] = [
	{
		productId: 1,
		name: 'Cemento Portland Gris 50kg',
		slug: toSlug('Cemento Portland Gris 50kg'),
		category: 'Materiales',
		sku: `CEM-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Cemento+Portland', imgKey: 'placeholder' }],
		tags: ['best-seller', 'featured'],
		isPublished: true,
		listPrice: 260.00,
		discountPrice: 0,
		brand: 'Cemex',
		avgRating: 4.8,
		numReviews: 45,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 2 },
			{ rating: 4, count: 10 },
			{ rating: 5, count: 33 },
		],
		numSales: 120,
		countInStock: 500,
		description: 'Cemento Portland gris de alta resistencia, ideal para todo tipo de construcción.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		costPerUnit: 200.00,
		attributes: [],
		variants: [],
	},
	{
		productId: 2,
		name: 'Cal Hidratada 25kg',
		slug: toSlug('Cal Hidratada 25kg'),
		category: 'Materiales',
		sku: `CAL-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Cal+Hidratada', imgKey: 'placeholder' }],
		tags: [],
		isPublished: true,
		listPrice: 85.00,
		discountPrice: 0,
		brand: 'Calidra',
		avgRating: 4.5,
		numReviews: 20,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 1 },
			{ rating: 3, count: 3 },
			{ rating: 4, count: 6 },
			{ rating: 5, count: 10 },
		],
		numSales: 80,
		countInStock: 300,
		description: 'Cal hidratada de alta pureza para construcción y estabilización de suelos.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		costPerUnit: 60.00,
		attributes: [],
		variants: [],
	},
	{
		productId: 3,
		name: 'Pala Cuadrada Puño Y',
		slug: toSlug('Pala Cuadrada Puño Y'),
		category: 'Herramientas',
		sku: `PAL-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Pala+Cuadrada', imgKey: 'placeholder' }],
		tags: ['featured'],
		isPublished: true,
		listPrice: 180.00,
		discountPrice: 170.00,
		brand: 'Truper',
		avgRating: 4.7,
		numReviews: 15,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 1 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 10 },
		],
		numSales: 45,
		countInStock: 50,
		description: 'Pala cuadrada con mango de madera y puño Y, resistente para trabajo pesado.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		costPerUnit: 120.00,
		attributes: [],
		variants: [],
	},
	{
		productId: 4,
		name: 'Carretilla 5.5ft3 Neumática',
		slug: toSlug('Carretilla 5.5ft3 Neumática'),
		category: 'Equipo',
		sku: `CAR-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Carretilla', imgKey: 'placeholder' }],
		tags: ['best-seller'],
		isPublished: true,
		listPrice: 1250.00,
		discountPrice: 0,
		costPerUnit: 900.00,
		brand: 'Truper',
		avgRating: 4.9,
		numReviews: 25,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 2 },
			{ rating: 5, count: 23 },
		],
		numSales: 60,
		countInStock: 20,
		description: 'Carretilla con llanta neumática reforzada, capacidad de 5.5 pies cúbicos.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		attributes: [],
		variants: [],
	},
	{
		productId: 5,
		name: 'Flexómetro 5m',
		slug: toSlug('Flexómetro 5m'),
		category: 'Herramientas',
		sku: `FLE-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Flexometro', imgKey: 'placeholder' }],
		tags: [],
		isPublished: true,
		listPrice: 95.00,
		discountPrice: 80.75,
		costPerUnit: 50.00,
		brand: 'Stanley',
		avgRating: 4.6,
		numReviews: 30,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 2 },
			{ rating: 4, count: 8 },
			{ rating: 5, count: 20 },
		],
		numSales: 150,
		countInStock: 100,
		description: 'Cinta métrica de 5 metros con freno y clip para cinturón.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 15,
		attributes: [],
		variants: [],
	},
	{
		productId: 6,
		name: 'Nivel de Aluminio 24"',
		slug: toSlug('Nivel de Aluminio 24"'),
		category: 'Herramientas',
		sku: `NIV-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Nivel+Aluminio', imgKey: 'placeholder' }],
		tags: [],
		isPublished: true,
		listPrice: 220.00,
		discountPrice: 0,
		costPerUnit: 150.00,
		brand: 'Truper',
		avgRating: 4.5,
		numReviews: 10,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 1 },
			{ rating: 4, count: 3 },
			{ rating: 5, count: 6 },
		],
		numSales: 25,
		countInStock: 30,
		description: 'Nivel de aluminio de 24 pulgadas con 3 gotas (0, 45 y 90 grados).',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		attributes: [],
		variants: [],
	},
	{
		productId: 7,
		name: 'Escalera de Tijera 6 peldaños',
		slug: toSlug('Escalera de Tijera 6 peldaños'),
		category: 'Equipo',
		sku: `ESC-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Escalera', imgKey: 'placeholder' }],
		tags: ['featured'],
		isPublished: true,
		listPrice: 1850.00,
		discountPrice: 1665.00,
		costPerUnit: 1300.00,
		brand: 'Cuprum',
		avgRating: 4.8,
		numReviews: 18,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 3 },
			{ rating: 5, count: 15 },
		],
		numSales: 35,
		countInStock: 15,
		description: 'Escalera de tijera de aluminio con 6 peldaños y tapa portaherramientas.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 10,
		attributes: [],
		variants: [],
	},
	{
		productId: 8,
		name: 'Martillo de Uña 16oz',
		slug: toSlug('Martillo de Uña 16oz'),
		category: 'Herramientas',
		sku: `MAR-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Martillo', imgKey: 'placeholder' }],
		tags: [],
		isPublished: true,
		listPrice: 150.00,
		discountPrice: 0,
		costPerUnit: 80.00,
		brand: 'Truper',
		avgRating: 4.9,
		numReviews: 40,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 36 },
		],
		numSales: 90,
		countInStock: 80,
		description: 'Martillo de uña curva de 16oz con mango de fibra de vidrio.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		attributes: [],
		variants: [],
	},
	{
		productId: 9,
		name: 'Taladro Rotomartillo 1/2"',
		slug: toSlug('Taladro Rotomartillo 1/2"'),
		category: 'Herramientas Eléctricas',
		sku: `TAL-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Taladro', imgKey: 'placeholder' }],
		tags: ['best-seller', 'featured'],
		isPublished: true,
		listPrice: 1450.00,
		discountPrice: 1305.00,
		costPerUnit: 1000.00,
		brand: 'DeWalt',
		avgRating: 4.9,
		numReviews: 55,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 1 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 50 },
		],
		numSales: 75,
		countInStock: 25,
		description: 'Taladro rotomartillo de 1/2 pulgada, velocidad variable y reversible.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 10,
		attributes: [],
		variants: [],
	},
	{
		productId: 10,
		name: 'Esmeriladora Angular 4-1/2"',
		slug: toSlug('Esmeriladora Angular 4-1/2"'),
		category: 'Herramientas Eléctricas',
		sku: `ESM-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Esmeriladora', imgKey: 'placeholder' }],
		tags: [],
		isPublished: true,
		listPrice: 1100.00,
		discountPrice: 0,
		costPerUnit: 750.00,
		brand: 'Makita',
		avgRating: 4.7,
		numReviews: 22,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 2 },
			{ rating: 4, count: 5 },
			{ rating: 5, count: 15 },
		],
		numSales: 40,
		countInStock: 30,
		description: 'Esmeriladora angular de 4-1/2 pulgadas, potente motor para corte y desbaste.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		attributes: [],
		variants: [],
	},
	{
		productId: 11,
		name: 'Grava Triturada 3/4" (m3)',
		slug: toSlug('Grava Triturada 3/4" (m3)'),
		category: 'Materiales',
		sku: `GRA-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Grava', imgKey: 'placeholder' }],
		tags: [],
		isPublished: true,
		listPrice: 650.00,
		discountPrice: 0,
		costPerUnit: 400.00,
		brand: 'Generico',
		avgRating: 4.5,
		numReviews: 8,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 1 },
			{ rating: 4, count: 2 },
			{ rating: 5, count: 5 },
		],
		numSales: 30,
		countInStock: 100,
		description: 'Grava triturada de 3/4 de pulgada, venta por metro cúbico.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		attributes: [],
		variants: [],
	},
	{
		productId: 12,
		name: 'Yeso Construcción 40kg',
		slug: toSlug('Yeso Construcción 40kg'),
		category: 'Materiales',
		sku: `YES-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Yeso', imgKey: 'placeholder' }],
		tags: [],
		isPublished: true,
		listPrice: 140.00,
		discountPrice: 0,
		brand: 'Generico',
		avgRating: 4.6,
		numReviews: 12,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 1 },
			{ rating: 4, count: 3 },
			{ rating: 5, count: 8 },
		],
		numSales: 50,
		countInStock: 200,
		description: 'Yeso para construcción de secado rápido, bulto de 40kg.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Single Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 5,
		discountType: 'Percentage',
		discountValue: 0,
		costPerUnit: 80.00,
		attributes: [],
		variants: [],
	},
	{
		productId: 13,
		name: 'Chaleco de Seguridad',
		slug: toSlug('Chaleco de Seguridad'),
		category: 'Equipo',
		sku: `CHA-${uniqueStoreId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
		images: [{ imgUrl: 'https://placehold.co/600x400.png?text=Chaleco', imgKey: 'placeholder' }],
		tags: ['new-arrival'],
		isPublished: true,
		listPrice: 180.00,
		discountPrice: 0,
		brand: 'Generico',
		avgRating: 0,
		numReviews: 0,
		ratingDistribution: [],
		numSales: 0,
		countInStock: 100,
		description: 'Chaleco de seguridad con cintas reflejantes, disponible en varios colores y tallas.',
		reviews: [],
		store: uniqueStoreId,
		warehouse: 'Warehouse 1',
		subCategory: 'None',
		unit: 'Piece',
		barcodeSymbology: 'Code 128',
		itemBarcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
		productType: 'Variable Product',
		taxType: 'Exclusive',
		tax: 16,
		quantityAlert: 10,
		discountType: 'Percentage',
		discountValue: 0,
		costPerUnit: 100.00,
		attributes: [
			{ name: 'Color', values: ['Naranja', 'Amarillo'] },
			{ name: 'Talla', values: ['M', 'L', 'XL'] }
		],
		variants: [
			{
				sku: `CHA-NAR-M-${Math.floor(1000 + Math.random() * 9000)}`,
				costPerUnit: 100.00,
				listPrice: 180.00,
				countInStock: 20,
				attributes: [{ name: 'Color', value: 'Naranja' }, { name: 'Talla', value: 'M' }]
			},
			{
				sku: `CHA-NAR-L-${Math.floor(1000 + Math.random() * 9000)}`,
				costPerUnit: 100.00,
				listPrice: 180.00,
				countInStock: 30,
				attributes: [{ name: 'Color', value: 'Naranja' }, { name: 'Talla', value: 'L' }]
			},
			{
				sku: `CHA-AMA-M-${Math.floor(1000 + Math.random() * 9000)}`,
				costPerUnit: 100.00,
				listPrice: 180.00,
				countInStock: 15,
				attributes: [{ name: 'Color', value: 'Amarillo' }, { name: 'Talla', value: 'M' }]
			},
			{
				sku: `CHA-AMA-L-${Math.floor(1000 + Math.random() * 9000)}`,
				costPerUnit: 100.00,
				listPrice: 180.00,
				countInStock: 35,
				attributes: [{ name: 'Color', value: 'Amarillo' }, { name: 'Talla', value: 'L' }]
			}
		]
	},
]

const attributes = [
	{ name: 'Color', values: ['Rojo', 'Azul', 'Verde'], store: uniqueStoreId, status: true },
	{ name: 'Talla', values: ['S', 'M', 'L', 'XL'], store: uniqueStoreId, status: true },
	{ name: 'Material', values: ['Algodón', 'Poliéster', 'Lana'], store: uniqueStoreId, status: true },
	{ name: 'Temporada', values: ['Verano', 'Invierno', 'Otoño', 'Primavera'], store: uniqueStoreId, status: true },
	{ name: 'Género', values: ['Hombre', 'Mujer', 'Unisex'], store: uniqueStoreId, status: true },
	{ name: 'Peso', values: ['Ligero', 'Medio', 'Pesado'], store: uniqueStoreId, status: true },
	{ name: 'Dimensiones', values: ['Pequeño', 'Mediano', 'Grande'], store: uniqueStoreId, status: true },
	{ name: 'Voltaje', values: ['110V', '220V'], store: uniqueStoreId, status: true },
	{ name: 'Potencia', values: ['100W', '200W', '500W'], store: uniqueStoreId, status: true },
	{ name: 'Capacidad', values: ['1L', '2L', '5L'], store: uniqueStoreId, status: true },
]

const companies = [
	{
		name: 'Mi Empresa S.A. de C.V.',
		ownerEmail: 'mario@example.com',
		plan: 'INTERMEDIATE',
		planStatus: 'FREE_TRIAL',
		trialStartDate: new Date('2025-01-20'),
		trialEndDate: new Date('2025-03-20'),
		freeMonths: 2,
	},
	{
		name: 'Materiales La Roca S.A.',
		ownerEmail: 'ana@example.com',
		plan: 'BASIC',
		planStatus: 'FREE_TRIAL',
		trialStartDate: new Date('2025-01-25'),
		trialEndDate: new Date('2025-02-25'),
		freeMonths: 1,
	},
	{
		name: 'Alpha Construcciones S.A. de C.V.',
		ownerEmail: 'luis@example.com',
		plan: 'ADVANCED',
		planStatus: 'ACTIVE',
		trialStartDate: new Date('2024-12-01'),
		trialEndDate: new Date('2025-01-01'),
		freeMonths: 0,
	}
]

const stores = [
	{ name: uniqueStoreName, slug: uniqueStoreId, companyName: 'Mi Empresa S.A. de C.V.', location: 'Sucursal Centro' },
	{ name: 'Materiales La Roca', slug: 'la-roca-1', companyName: 'Materiales La Roca S.A.', location: 'Sucursal Matriz' },
	{ name: 'Alpha Construcciones', slug: 'alpha-corp', companyName: 'Alpha Construcciones S.A. de C.V.', location: 'Sede Central' }
]

const warehouses = [
	{ name: 'Almacén General', slug: 'almacen-general', companyName: 'Mi Empresa S.A. de C.V.', location: 'Calle Industrial 456' },
	{ name: 'Bodega La Roca', slug: 'bodega-roca', companyName: 'Materiales La Roca S.A.', location: 'Av. Industrial 78' },
	{ name: 'Centro de Distribución Alpha', slug: 'cedis-alpha', companyName: 'Alpha Construcciones S.A. de C.V.', location: 'Zona Industrial 101' }
]


const customers: ICustomer[] = [
	{
		name: 'Juan Perez',
		email: 'juan.perez@example.com',
		phone: '555-0123',
		address: 'Calle Falsa 123',
		city: 'Ciudad de México',
		storeId: uniqueStoreId,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as ICustomer,
	{
		name: 'Maria Lopez',
		email: 'maria.lopez@example.com',
		phone: '555-0456',
		address: 'Avenida Siempre Viva 742',
		city: 'Guadalajara',
		storeId: uniqueStoreId,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as ICustomer,
	{
		name: 'Carlos Sanchez',
		email: 'carlos.sanchez@example.com',
		phone: '555-0789',
		address: 'Boulevard de los Sueños Rotos 10',
		city: 'Monterrey',
		storeId: uniqueStoreId,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as ICustomer
]

export const globalCatalog = [
	{
		industry: 'general',
		categories: [
			{
				name: 'Varios',
				subcategories: ['General', 'Otros', 'Surtido'],
				units: ['Pieza', 'Unidad', 'Servicio', 'Juego'],
				brands: ['Genérico', 'Varios', 'Sin Marca']
			}
		]
	},
	{
		industry: 'farmacia',
		categories: [
			{
				name: 'Medicamentos',
				subcategories: [
					'Analgésicos y Antiinflamatorios',
					'Antibióticos',
					'Antigripales y Antialérgicos',
					'Vitaminas y Suplementos',
					'Medicamentos Dermatológicos',
					'Anticonceptivos',
					'Medicamentos Gastrointestinales',
					'Medicamentos Cardiovasculares',
					'Medicamentos para Diabetes',
					'Medicamentos Respiratorios'
				],
				units: ['Tableta', 'Cápsula', 'Frasco', 'Ampolleta', 'Jeringa', 'Crema', 'Ungüento', 'Gotas', 'Supositorio', 'Parche'],
				brands: ['Pfizer', 'Bayer', 'GSK', 'Sanofi', 'Novartis', 'Roche', 'AstraZeneca', 'Merck', 'Johnson & Johnson', 'Genérico', 'Similares', 'Farmacias del Ahorro']
			},
			{
				name: 'Cuidado Personal',
				subcategories: [
					'Cuidado Oral',
					'Shampoo y Acondicionadores',
					'Jabones y Gel de Baño',
					'Desodorantes y Antitranspirantes',
					'Cuidado Facial',
					'Protección Solar',
					'Cuidado Femenino',
					'Pañales para Adultos',
					'Toallas Húmedas'
				],
				units: ['Pieza', 'Paquete', 'Tubo', 'Botella', 'Frasco', 'Barra', 'Sobre'],
				brands: ['Colgate', 'Oral-B', 'Dove', 'Pantene', 'Head & Shoulders', 'Nivea', 'Rexona', 'Neutrogena', 'Always', 'Huggies', 'Pampers']
			},
			{
				name: 'Equipo Médico',
				subcategories: [
					'Termómetros',
					'Tensíometros',
					'Pruebas de Embarazo',
					'Pruebas de Glucosa',
					'Curitas y Apósitos',
					'Cubrebocas',
					'Guantes Médicos',
					'Jeringas y Agujas'
				],
				units: ['Pieza', 'Paquete', 'Caja', 'Juego'],
				brands: ['Omron', 'Accu-Chek', 'OneTouch', 'Band-Aid', '3M', 'Medline']
			}
		]
	},
	{
		industry: 'abarrotes',
		categories: [
			{
				name: 'Alimentos Básicos',
				subcategories: [
					'Arroz y Granos',
					'Frijol y Legumbres',
					'Pastas y Harinas',
					'Aceites y Grasas',
					'Azúcar y Endulzantes',
					'Sal y Especias',
					'Conservas y Enlatados',
					'Sopas y Caldos'
				],
				units: ['Kilogramo', 'Gramo', 'Litro', 'Mililitro', 'Pieza', 'Paquete', 'Lata'],
				brands: ['Herdez', 'La Costeña', 'Knorr', 'McCormick', 'Cristal', 'Zwan', 'Great Value', 'Safeway']
			},
			{
				name: 'Bebidas',
				subcategories: [
					'Refrescos y Gaseosas',
					'Jugos y Néctares',
					'Aguas y Bebidas Hidratantes',
					'Cervezas',
					'Vinos y Licores',
					'Bebidas Energéticas',
					'Leche y Bebidas Lácteas',
					'Tés y Cafés Preparados'
				],
				units: ['Mililitro', 'Litro', 'Botella', 'Lata', 'Six-pack', 'Caja', 'Garrafón'],
				brands: ['Coca-Cola', 'Pepsi', 'Jumex', 'Boing', 'Bonafont', 'Corona', 'Modelo', 'Heineken', 'Nestlé', 'Lala', 'Alpura']
			},
			{
				name: 'Botana y Dulces',
				subcategories: [
					'Papas Fritas y Frituras',
					'Galletas y Pastelitos',
					'Chocolates y Dulces',
					'Frutos Secos',
					'Palomitas y Botanas',
					'Gomas y Caramelos',
					'Helados y Postres Congelados'
				],
				units: ['Gramo', 'Paquete', 'Pieza', 'Caja', 'Bolsa'],
				brands: ['Sabritas', 'Barcel', 'Gamesa', 'Marinela', 'Coca-Cola (snacks)', 'Nestlé', 'Hershey\'s', 'M&M\'s']
			}
		]
	},
	{
		industry: 'ferretería',
		categories: [
			{
				name: 'Herramientas',
				subcategories: [
					'Herramientas Manuales',
					'Herramientas Eléctricas',
					'Herramientas de Medición',
					'Herramientas de Corte',
					'Cajas y Organizadores',
					'Escaleras y Andamios',
					'Equipo de Seguridad'
				],
				units: ['Pieza', 'Juego', 'Set', 'Paquete', 'Metro'],
				brands: ['Truper', 'Urrea', 'Stanley', 'DeWalt', 'Bosch', 'Makita', 'Black & Decker', 'Milwaukee']
			},
			{
				name: 'Materiales de Construcción',
				subcategories: [
					'Cemento y Agregados',
					'Varilla y Alambre',
					'Madera y Tablas',
					'Pegamentos y Adhesivos',
					'Pinturas y Recubrimientos',
					'Plomería y Tubería',
					'Material Eléctrico',
					'Cerámica y Azulejo'
				],
				units: ['Kilogramo', 'Pieza', 'Metro', 'Litro', 'Galón', 'Saco', 'Tabla'],
				brands: ['Cemex', 'Apasco', 'Comex', 'Sherwin-Williams', 'Rotoplas', 'Kwikset', 'Leviton', 'Steren']
			}
		]
	},
	{
		industry: 'ropa',
		categories: [
			{
				name: 'Ropa',
				subcategories: [
					'Camisetas y Playeras',
					'Pantalones y Jeans',
					'Vestidos y Faldas',
					'Suéteres y Sudaderas',
					'Ropa Interior',
					'Ropa Deportiva',
					'Trajes y Etiqueta',
					'Ropa para Bebés'
				],
				units: ['Pieza', 'Par', 'Juego', 'Paquete'],
				brands: ['Levi\'s', 'Nike', 'Adidas', 'Zara', 'H&M', 'Calvin Klein', 'Tommy Hilfiger', 'Under Armour']
			},
			{
				name: 'Calzado',
				subcategories: [
					'Tenis y Zapatillas',
					'Zapatos Formales',
					'Sandalias y Huaraches',
					'Botas y Botines',
					'Calzado Deportivo',
					'Calzado para Niños',
					'Accesorios para Calzado'
				],
				units: ['Par', 'Pieza', 'Juego'],
				brands: ['Nike', 'Adidas', 'Converse', 'Vans', 'Skechers', 'Steve Madden', 'Clarks', 'Timberland']
			}
		]
	},
	{
		industry: 'tienda-de-conveniencia',
		categories: [
			{
				name: 'Productos de Conveniencia',
				subcategories: [
					'Bebidas Frías',
					'Bebidas Calientes',
					'Snacks Rápidos',
					'Dulces y Chocolates',
					'Sándwiches y Comida Rápida',
					'Helados',
					'Cigarros y Tabaco',
					'Revistas y Periódicos'
				],
				units: ['Pieza', 'Paquete', 'Lata', 'Botella'],
				brands: ['Coca-Cola', 'Pepsi', 'Mars', 'Snickers', 'Oxxo (marca propia)', '7-Eleven', 'Bimbo', 'Lays']
			}
		]
	},
	{
		industry: 'papelería',
		categories: [
			{
				name: 'Material Escolar',
				subcategories: [
					'Cuadernos y Libretas',
					'Lápices y Bolígrafos',
					'Colores y Marcadores',
					'Calculadoras',
					'Mochilas y Loncheras',
					'Reglas y Geometría',
					'Papelería General'
				],
				units: ['Pieza', 'Paquete', 'Caja', 'Juego', 'Resma'],
				brands: ['Bic', 'Paper Mate', 'Faber-Castell', 'Pelikan', 'Norma', 'Scribe', 'Crayola', 'Casio']
			},
			{
				name: 'Oficina',
				subcategories: [
					'Papel y Resmas',
					'Impresión y Copiado',
					'Archivo y Organización',
					'Encuadernación',
					'Artículos de Escritorio',
					'Presentaciones',
					'Sellos y Tintas'
				],
				units: ['Pieza', 'Resma', 'Caja', 'Paquete', 'Juego'],
				brands: ['HP', 'Epson', 'Canon', 'Post-it', 'Avery', 'Staples', 'Office Depot', 'Fellowes']
			}
		]
	},
	{
		industry: 'cosmeticos',
		categories: [
			{
				name: 'Maquillaje',
				subcategories: [
					'Bases y Correctores',
					'Labiales y Brillos',
					'Sombras y Delineadores',
					'Rubores y Bronceadores',
					'Máscaras de Pestañas',
					'Cepillos y Aplicadores',
					'Kits de Maquillaje'
				],
				units: ['Pieza', 'Kit', 'Paleta', 'Tubo', 'Frasco'],
				brands: ['Maybelline', 'L\'Oréal', 'MAC', 'Revlon', 'NYX', 'Avon', 'Mary Kay', 'NARS']
			},
			{
				name: 'Cuidado de la Piel',
				subcategories: [
					'Crema Facial',
					'Limpiadores y Tónicos',
					'Protectores Solares',
					'Tratamientos Anti-edad',
					'Cuidado Corporal',
					'Mascarillas',
					'Contorno de Ojos'
				],
				units: ['Mililitro', 'Gramo', 'Tubo', 'Frasco', 'Pote'],
				brands: ['Neutrogena', 'Cetaphil', 'La Roche-Posay', 'Nivea', 'Olay', 'Bioderma', 'Vichy', 'CeraVe']
			}
		]
	},
	{
		industry: 'electronica',
		categories: [
			{
				name: 'Electrónica',
				subcategories: [
					'Celulares y Tablets',
					'Computadoras y Laptops',
					'Televisores y Monitores',
					'Audio y Sonido',
					'Videojuegos',
					'Cámaras y Fotografía',
					'GPS y Navegación'
				],
				units: ['Pieza', 'Juego', 'Kit', 'Paquete'],
				brands: ['Apple', 'Samsung', 'Sony', 'LG', 'HP', 'Dell', 'Microsoft', 'Nintendo']
			},
			{
				name: 'Accesorios',
				subcategories: [
					'Cables y Cargadores',
					'Audífonos',
					'Fundas y Protección',
					'Memorias y Almacenamiento',
					'Baterías',
					'Adaptadores',
					'Soporte y Brazos'
				],
				units: ['Pieza', 'Par', 'Juego', 'Paquete'],
				brands: ['Belkin', 'Anker', 'Logitech', 'JBL', 'SanDisk', 'Seagate', 'Case Logic', 'OtterBox']
			}
		]
	},
	{
		industry: 'juguetería',
		categories: [
			{
				name: 'Juguetes',
				subcategories: [
					'Muñecas y Accesorios',
					'Carritos y Vehículos',
					'Juguetes Educativos',
					'Juegos de Mesa',
					'Peluches',
					'Juguetes de Exterior',
					'Juguetes para Bebés',
					'Figuras de Acción'
				],
				units: ['Pieza', 'Juego', 'Set', 'Paquete'],
				brands: ['LEGO', 'Mattel', 'Hasbro', 'Fisher-Price', 'Barbie', 'Hot Wheels', 'Nerf', 'Play-Doh']
			}
		]
	},
	{
		industry: 'librería',
		categories: [
			{
				name: 'Libros',
				subcategories: [
					'Literatura y Novelas',
					'Libros Académicos',
					'Libros Infantiles',
					'Revistas y Periódicos',
					'Best Sellers',
					'Libros de Texto',
					'Libros Especializados',
					'E-books y Audiolibros'
				],
				units: ['Pieza', 'Colección', 'Paquete', 'Suscripción'],
				brands: ['Penguin', 'HarperCollins', 'Random House', 'McGraw-Hill', 'Pearson', 'Cambridge', 'Oxford']
			}
		]
	},
	{
		industry: 'mascotas',
		categories: [
			{
				name: 'Alimentos para Mascotas',
				subcategories: [
					'Alimento para Perros',
					'Alimento para Gatos',
					'Alimento para Aves',
					'Alimento para Peces',
					'Premios y Golosinas',
					'Suplementos',
					'Alimento Especializado'
				],
				units: ['Kilogramo', 'Gramo', 'Lata', 'Bolsa', 'Paquete'],
				brands: ['Purina', 'Pedigree', 'Whiskas', 'Royal Canin', 'Hills', 'Iams', 'Eukanuba']
			},
			{
				name: 'Accesorios',
				subcategories: [
					'Correas y Collares',
					'Camas y Casas',
					'Juguetes',
					'Cepillos y Cuidado',
					'Arenas y Desechables',
					'Comederos y Bebederos',
					'Transportadoras'
				],
				units: ['Pieza', 'Juego', 'Paquete', 'Kilogramo'],
				brands: ['Petmate', 'Kong', 'Hartz', 'Trixie', 'Ferplast', 'Outward Hound']
			}
		]
	},
	{
		industry: 'deportes',
		categories: [
			{
				name: 'Equipo Deportivo',
				subcategories: [
					'Ropa Deportiva',
					'Calzado Deportivo',
					'Pelotas',
					'Raquetas',
					'Pesas y Ejercicio',
					'Bicicletas y Accesorios',
					'Natación',
					'Campismo y Outdoor'
				],
				units: ['Pieza', 'Par', 'Juego', 'Set'],
				brands: ['Nike', 'Adidas', 'Under Armour', 'Reebok', 'Wilson', 'Spalding', 'Schwinn', 'Columbia']
			}
		]
	},
	{
		industry: 'alimentos-preparados',
		categories: [
			{
				name: 'Comida Preparada',
				subcategories: [
					'Platos del Día',
					'Ensaladas',
					'Sándwiches y Tortas',
					'Pizzas',
					'Pastas',
					'Postres',
					'Bebidas Preparadas',
					'Desayunos'
				],
				units: ['Porción', 'Plato', 'Orden', 'Pieza', 'Litro'],
				brands: ['Propio', 'Local', 'Casero']
			}
		]
	},
	{
		industry: 'panadería',
		categories: [
			{
				name: 'Panadería',
				subcategories: [
					'Pan Dulce',
					'Pan Salado',
					'Pasteles',
					'Galletas',
					'Donas',
					'Pan de Caja',
					'Repostería Fina',
					'Productos para Diabéticos'
				],
				units: ['Pieza', 'Kilogramo', 'Docena', 'Paquete'],
				brands: ['Bimbo', 'Marinela', 'Tía Rosa', 'Larín', 'Propio', 'Artesanal']
			}
		]
	},
	{
		industry: 'carnicería',
		categories: [
			{
				name: 'Carnes',
				subcategories: [
					'Res',
					'Pollo',
					'Cerdo',
					'Pescados y Mariscos',
					'Embutidos',
					'Carnes Frías',
					'Cortes Especiales',
					'Orgánicos'
				],
				units: ['Kilogramo', 'Gramo', 'Pieza', 'Paquete'],
				brands: ['Sukarne', 'Kekén', 'Parma', 'Fud', 'San Rafael', 'Local', 'Granja']
			}
		]
	},
	{
		industry: 'frutas-verduras',
		categories: [
			{
				name: 'Frutas y Verduras',
				subcategories: [
					'Frutas Tropicales',
					'Verduras de Hoja',
					'Raíces y Tubérculos',
					'Cítricos',
					'Frutos del Bosque',
					'Orgánicos',
					'Exóticos',
					'Precortados y Ensaladas'
				],
				units: ['Kilogramo', 'Gramo', 'Pieza', 'Manojo', 'Bolsa', 'Caja'],
				brands: ['Del Monte', 'Dole', 'Chiquita', 'Local', 'Orgánico', 'Productor Directo']
			}
		]
	},
	{
		industry: 'automotriz',
		categories: [
			{
				name: 'Refacciones',
				subcategories: [
					'Filtros',
					'Bujías y Cables',
					'Frenos',
					'Suspensión',
					'Motor',
					'Transmisión',
					'Escape',
					'Iluminación'
				],
				units: ['Pieza', 'Juego', 'Kit', 'Par', 'Litro'],
				brands: ['Bosch', 'NGK', 'ACDelco', 'Monroe', 'KYB', 'Denso', 'Valeo', 'Mopar']
			},
			{
				name: 'Accesorios',
				subcategories: [
					'Audio para Auto',
					'Alarmas y Seguridad',
					'Limpieza y Cuidado',
					'Interiores',
					'Exteriores',
					'Herramientas para Auto',
					'Neumáticos y Llantas'
				],
				units: ['Pieza', 'Juego', 'Kit', 'Par'],
				brands: ['Pioneer', 'Kenwood', 'Michelin', 'Goodyear', 'Meguair\'s', 'Armor All', 'WeatherTech']
			}
		]
	},
	{
		industry: 'mueblería',
		categories: [
			{
				name: 'Muebles',
				subcategories: [
					'Sala',
					'Comedor',
					'Recámara',
					'Oficina',
					'Exterior',
					'Juvenil',
					'Modular',
					'Accesorios'
				],
				units: ['Pieza', 'Juego', 'Set', 'Paquete'],
				brands: ['IKEA', 'Muebles Dico', 'Troncoso', 'Flexi', 'Muebles Tapizados', 'Artens', 'Local']
			}
		]
	},
	{
		industry: 'tecnología',
		categories: [
			{
				name: 'Gadgets',
				subcategories: [
					'Wearables',
					'Smart Home',
					'Audio Portátil',
					'Cámaras de Acción',
					'Drones',
					'Realidad Virtual',
					'Power Banks',
					'Streaming Devices'
				],
				units: ['Pieza', 'Kit', 'Juego'],
				brands: ['Apple', 'Samsung', 'GoPro', 'DJI', 'Fitbit', 'Garmin', 'Sonos', 'Amazon']
			}
		]
	},
	{
		industry: 'regalos',
		categories: [
			{
				name: 'Regalos',
				subcategories: [
					'Tarjetas y Papelería',
					'Velas y Aromatizantes',
					'Decoración',
					'Joyería de Fantasía',
					'Artículos de Temporada',
					'Personalizados',
					'Experiencias',
					'Flores y Plantas'
				],
				units: ['Pieza', 'Juego', 'Arreglo', 'Paquete'],
				brands: ['Hallmark', 'Yankee Candle', 'Papyrus', 'Local', 'Artístico', 'Personalizado']
			}
		]
	},
	{
		industry: 'joyería',
		categories: [
			{
				name: 'Joyería',
				subcategories: [
					'Anillos',
					'Collares y Cadenas',
					'Aretes',
					'Pulseras',
					'Relojes',
					'Joyería en Plata',
					'Joyería en Oro',
					'Piedras Preciosas'
				],
				units: ['Pieza', 'Par', 'Juego'],
				brands: ['Pandora', 'Swarovski', 'Tiffany & Co.', 'Cartier', 'Rolex', 'Tag Heuer', 'Local', 'Platería']
			}
		]
	}
];

const data: Data = {
	headerMenus: [
		{
			name: "Today's Deal",
			href: '/search?tag=todays-deal',
		},
		{
			name: 'New Arrivals',
			href: '/search?tag=new-arrival',
		},
		{
			name: 'Featured Products',
			href: '/search?tag=featured',
		},
		{
			name: 'Best Sellers',
			href: '/search?tag=best-seller',
		},
		{
			name: 'Browsing History',
			href: '/#browsing-history',
		},
		{
			name: 'Customer Service',
			href: '/page/customer-service',
		},
		{
			name: 'About Us',
			href: '/page/about-us',
		},
		{
			name: 'Help',
			href: '/page/help',
		},
	],

	carousels: [
		{
			title: 'Materiales de Construcción',
			description:
				'Todo lo que necesitas para tu obra, desde cimientos hasta acabados.',
			buttonCaption: 'Ver Materiales',
			image: '/images/banner-construction-1.jpg',
			url: '/search?category=Materiales',
			isPublished: true,
		},
		{
			title: 'Herramientas Profesionales',
			description:
				'Equipa a tu equipo con las mejores herramientas del mercado.',
			buttonCaption: 'Ver Herramientas',
			image: '/images/banner-tools-1.jpg',
			url: '/search?category=Herramientas',
			isPublished: true,
		},
		{
			title: 'Ofertas de Temporada',
			description: 'Aprovecha nuestros descuentos en equipos y maquinaria ligera.',
			buttonCaption: 'Ver Ofertas',
			image: '/images/banner-offers-1.jpg',
			url: '/search?tag=todays-deal',
			isPublished: true,
		},
	],
	products,
	users,
	reviews,
	categories,
	subCategories,
	brands,
	units,
	attributes,
	companies,
	stores,
	warehouses,
	customers,
	orders: [
		{
			userEmail: 'mario@example.com',
			storeId: uniqueStoreId,
			items: [
				{
					clientId: 'POS',
					productName: 'Cemento Portland Gris 50kg',
					quantity: 2,
					price: 260.00,
					category: 'Materiales',
					sku: 'CEM-POS-001',
					image: 'https://placehold.co/600x400.png?text=Cemento+Portland',
					slug: 'cemento-portland-gris-50kg'
				}
			],
			paymentMethod: 'Cash',
			totalPrice: 520.00,
			isPaid: true,
			isDelivered: true,
			createdAt: new Date('2024-12-24T10:00:00Z')
		},
		{
			userEmail: 'jack@example.com',
			storeId: uniqueStoreId,
			items: [
				{
					clientId: 'POS',
					productName: 'Pala Cuadrada Puño Y',
					quantity: 1,
					price: 180.00,
					category: 'Herramientas',
					sku: 'PAL-POS-001',
					image: 'https://placehold.co/600x400.png?text=Pala+Cuadrada',
					slug: 'pala-cuadrada-puno-y'
				}
			],
			paymentMethod: 'Card',
			totalPrice: 180.00,
			isPaid: true,
			isDelivered: true,
			createdAt: new Date('2024-12-25T14:30:00Z')
		},
		{
			userEmail: 'mario@example.com',
			storeId: uniqueStoreId,
			items: [
				{
					clientId: 'POS',
					productName: 'Taladro Rotomartillo 1/2"',
					quantity: 1,
					price: 1450.00,
					category: 'Herramientas Eléctricas',
					sku: 'TAL-POS-001',
					image: 'https://placehold.co/600x400.png?text=Taladro',
					slug: 'taladro-rotomartillo-1-2'
				}
			],
			paymentMethod: 'Cash',
			totalPrice: 1450.00,
			isPaid: false,
			isDelivered: false,
			createdAt: new Date('2025-01-10T09:15:00Z')
		}
	]
}


export default data
