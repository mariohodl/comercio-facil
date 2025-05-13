import { Data, IProductInput, IUserInput } from '@/types';
import { toSlug } from './utils';

import bcrypt from 'bcryptjs';
const users: IUserInput[] = [
	{
		name: 'Ricardo',
		email: 'ricardo@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Admin',
		address: {
			fullName: 'Ricardo García',
			street: 'Juan Manuel 279',
			city: 'Guadalajara',
			province: 'Jal',
			postalCode: '64200',
			country: 'MX',
			phone: '123-456-7890',
		},
		paymentMethod: 'Stripe',
		emailVerified: false,
	},
	{
		name: 'Mario',
		email: 'mario@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Admin',
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
	},
	{
		name: 'Jack',
		email: 'jack@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'User',
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
	},
	{
		name: 'Ezo',
		email: 'enzo@example.com',
		password: bcrypt.hashSync('123456', 5),
		role: 'Receptor',
		address: {
			fullName: 'Enzo rodriguez',
			street: 'Av. prolongacion 123',
			city: 'Monterrey',
			province: 'NL',
			postalCode: '44617',
			country: 'MX',
			phone: '123-456-7890',
		},
		paymentMethod: 'Stripe',
		emailVerified: false,
	},

];

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
		name: 'Nike Mens Slim-fit Long-Sleeve T-Shirt',
		slug: toSlug('Nike Mens Slim-fit Long-Sleeve T-Shirt'),
		category: 'T-Shirts',
		images: ['/images/p11-1.jpg', '/images/p11-2.jpg'],
		tags: ['new-arrival'],
		isPublished: true,
		price: 21.8,
		listPrice: 0,
		brand: 'Nike',
		avgRating: 4.71,
		numReviews: 7,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 2 },
			{ rating: 5, count: 5 },
		],
		numSales: 9,
		countInStock: 11,
		description:
			'Made with chemicals safer for human health and the environment',
		reviews: [],
	},
	{
		name: 'Jerzees Long-Sleeve Heavyweight Blend T-Shirt',
		slug: toSlug('Jerzees Long-Sleeve Heavyweight Blend T-Shirt'),
		category: 'T-Shirts',
		images: [
			'/images/p12-1.jpg',
			'/images/p12-2.jpg',
			'/images/p12-3.jpg',
			'/images/p12-4.jpg',
		],
		tags: ['featured'],
		isPublished: true,
		price: 23.78,
		listPrice: 0,
		brand: 'Jerzees',
		avgRating: 4.2,
		numReviews: 10,
		ratingDistribution: [
			{ rating: 1, count: 1 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 5 },
		],
		numSales: 29,
		countInStock: 12,
		description:
			'Made with sustainably sourced USA grown cotton; Shoulder-to-shoulder tape; double-needle coverstitched front neck; Set-in sleeves; Rib cuffs with concealed seams; Seamless body for a wide printing area',
		reviews: [],
	},
	{
		name: "Jerzees Men's Long-Sleeve T-Shirt",
		slug: toSlug('Jerzees Men Long-Sleeve T-Shirt'),
		category: 'T-Shirts',
		brand: 'Jerzees',
		images: ['/images/p13-1.jpg', '/images/p13-2.jpg'],
		tags: ['best-seller'],
		isPublished: true,
		price: 13.86,
		listPrice: 16.03,
		avgRating: 4,
		numReviews: 12,
		ratingDistribution: [
			{ rating: 1, count: 1 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 2 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 5 },
		],
		numSales: 55,
		countInStock: 13,
		description:
			'The Jerzees long sleeve t-shirt is made with dri-power technology that wicks away moisture to keep you cool and dry throughout your day. We also included a rib collar and cuffs for added durability, and a lay-flat collar for comfort. If you are looking for a versatile shirt that you can wear throughout the transitioning seasons, then look no further.',
		reviews: [],
	},
	{
		name: 'Dickies Mens Relaxed Fit Carpenter Jean',
		slug: toSlug('Dickies Mens Relaxed Fit Carpenter Jean'),
		category: 'Jeans',
		brand: 'Dickies',
		images: ['/images/p25-1.jpg', '/images/p25-2.jpg'],
		tags: ['new-arrival', 'featured'],
		isPublished: true,
		price: 95.34,
		listPrice: 0,
		avgRating: 3.66,
		numReviews: 15,
		ratingDistribution: [
			{ rating: 1, count: 1 },
			{ rating: 2, count: 2 },
			{ rating: 3, count: 3 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 5 },
		],
		countInStock: 25,
		numSales: 48,
		description:
			'Relaxed work jean with traditional carpenter-style pockets and logo patch at back pockets',
		reviews: [],
	},
	{
		name: 'Wrangler mens Premium Performance Cowboy Cut Slim Fit Jean',
		slug: toSlug('Wrangler mens Premium Performance Cowboy Cut Slim Fit Jean'),
		category: 'Jeans',
		brand: 'Wrangler',
		images: ['/images/p26-1.jpg', '/images/p26-2.jpg'],
		tags: ['best-seller', 'todays-deal'],
		isPublished: true,
		price: 81.78,
		listPrice: 149.99,
		avgRating: 3.46,
		numReviews: 13,
		ratingDistribution: [
			{ rating: 1, count: 1 },
			{ rating: 2, count: 2 },
			{ rating: 3, count: 3 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 3 },
		],
		countInStock: 26,
		numSales: 48,
		description:
			'Designed with a functional fit in mind, these jeans are made to stack over your favorite pair of boots. Constructed with a slim fit in the waist, seat, and thigh, this jean is made for both function and comfort for long days in the saddle.',
		reviews: [],
	},
	{
		name: "Seiko Men's Analogue Watch with Black Dial",
		slug: toSlug("Seiko Men's Analogue Watch with Black Dial"),
		category: 'Wrist Watches',
		brand: 'Seiko',
		images: ['/images/p31-1.jpg', '/images/p31-2.jpg'],
		tags: ['new-arrival'],
		isPublished: true,
		price: 530.0,
		listPrice: 0,
		avgRating: 4.71,
		numReviews: 7,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 2 },
			{ rating: 5, count: 5 },
		],
		countInStock: 31,
		numSales: 48,
		description:
			'Casing: Case made of stainless steel Case shape: round Case colour: silver Glass: Hardlex Clasp type: Fold over clasp with safety',
		reviews: [],
	},
	{
		name: 'SEIKO 5 Sport SRPJ83 Beige Dial Nylon Automatic Watch, Beige, Automatic Watch',
		slug: toSlug(
			'SEIKO 5 Sport SRPJ83 Beige Dial Nylon Automatic Watch, Beige, Automatic Watch'
		),
		category: 'Wrist Watches',
		brand: 'Seiko',
		images: ['/images/p32-1.jpg', '/images/p32-2.jpg'],
		tags: ['featured'],
		isPublished: true,
		price: 375.83,
		listPrice: 400,
		avgRating: 4.2,
		numReviews: 10,
		ratingDistribution: [
			{ rating: 1, count: 1 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 5 },
		],
		countInStock: 32,
		numSales: 48,
		description:
			'Seiko 5 Sports Collection Inspired by vintage field/aviator style: Automatic with manual winding capability',
		reviews: [],
	},
	{
		name: "Casio Men's Heavy Duty Analog Quartz Stainless Steel Strap, Silver, 42 Casual Watch ",
		slug: toSlug(
			"Casio Men's Heavy Duty Analog Quartz Stainless Steel Strap, Silver, 42 Casual Watch"
		),
		category: 'Wrist Watches',
		brand: 'Casio',
		images: ['/images/p33-1.jpg', '/images/p33-2.jpg'],
		tags: ['best-seller'],
		isPublished: true,
		price: 60.78,
		listPrice: 0,
		avgRating: 4,
		numReviews: 12,
		ratingDistribution: [
			{ rating: 1, count: 1 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 2 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 5 },
		],
		countInStock: 33,
		numSales: 48,
		description:
			'The Casio range is growing with this model  MWA-100H-1AVEF. Sporting a stainless steel case with a brushed finish, it will easily withstand all the shocks of everyday life.',
		reviews: [],
	},
	{
		name: 'adidas Mens Grand Court 2.0 Training Shoes Training Shoes',
		slug: toSlug('adidas Mens Grand Court 2.0 Training Shoes Training Shoes'),
		category: 'Shoes',
		brand: 'adidas',
		images: ['/images/p41-1.jpg', '/images/p41-2.jpg'],
		tags: ['new-arrival'],
		isPublished: true,
		price: 81.99,
		listPrice: 0,
		avgRating: 4.71,
		numReviews: 7,
		ratingDistribution: [
			{ rating: 1, count: 0 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 2 },
			{ rating: 5, count: 5 },
		],
		countInStock: 41,
		numSales: 48,
		description:
			'Cloudfoam Comfort sockliner is ultra-soft and plush, with two layers of cushioning topped with soft, breathable mesh',
		reviews: [],
	},
	{
		name: "ziitop Men's Running Walking Shoes Fashion Sneakers Mesh Dress Shoes Business Oxfords Shoes Lightweight Casual Breathable Work Formal Shoes",
		slug: toSlug(
			"ziitop Men's Running Walking Shoes Fashion Sneakers Mesh Dress Shoes Business Oxfords Shoes Lightweight Casual Breathable Work Formal Shoes"
		),
		category: 'Shoes',
		brand: 'ziitop',
		images: ['/images/p42-1.jpg', '/images/p42-2.jpg'],
		tags: ['featured'],
		isPublished: true,
		price: 39.97,
		listPrice: 49.96,
		avgRating: 4.2,
		numReviews: 10,
		ratingDistribution: [
			{ rating: 1, count: 1 },
			{ rating: 2, count: 0 },
			{ rating: 3, count: 0 },
			{ rating: 4, count: 4 },
			{ rating: 5, count: 5 },
		],
		countInStock: 42,
		numSales: 50,
		description:
			'Cloudfoam Comfort sockliner is ultra-soft and plush, with two layers of cushioning topped with soft, breathable mesh',
		reviews: [],
	},
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
			title: 'Carne Premium, Prerium',
			description:
				'Tenemos la mejor selección de carnes de calidad para consumidores premium, no olvides cuidar el paladar de tus clientes de los sighentes compormados.',
			buttonCaption: 'Comprar ahora',
			image: '/images/SLIDE_01.jpg',
			url: '/search?category=Shoes',
			isPublished: true,
		},
		{
			title: 'Finos cortes de carne ',
			description:
				'Nuestra selección de carnes de alta calidad para consumidores premium de todas las edades y de todos los gustos para todos los gustos.',
			buttonCaption: 'Comprar ahora',
			image: '/images/SLIDE_02.jpg',
			url: '/search?category=T-Shirts',
			isPublished: true,
		},
		{
			title: 'Chef, restaurantes y más',
			description: 'Un chef puede necesitar carne para sus platos',
			buttonCaption: 'Ver más',
			image: '/images/SLIDE_03.jpg',
			url: '/search?category=Wrist Watches',
			isPublished: true,
		},
	],
	products,
	users,
	reviews,
};

// const meatProductsToRefine = [
// 	{
// 		product_id: 1,
// 		name: 'Prime Rib Roast',
// 		description:
// 			'A succulent cut of beef, perfect for roasting or slow-cooking.',
// 		price_per_kg: 25.99,
// 		weight_kg: 2.5,
// 		category: 'Beef',
// 		cut_type: 'Rib',
// 		availability: 'In Stock',
// 	},
// 	{
// 		product_id: 2,
// 		name: 'Pork Tenderloin',
// 		description:
// 			'A lean and tender cut of pork, ideal for grilling or roasting.',
// 		price_per_kg: 18.5,
// 		weight_kg: 1.2,
// 		category: 'Pork',
// 		cut_type: 'Tenderloin',
// 		availability: 'In Stock',
// 	},
// 	{
// 		product_id: 3,
// 		name: 'Chicken Drumsticks',
// 		description:
// 			'Juicy and flavorful chicken drumsticks, great for grilling or frying.',
// 		price_per_kg: 7.99,
// 		weight_kg: 1.5,
// 		category: 'Poultry',
// 		cut_type: 'Drumstick',
// 		availability: 'In Stock',
// 	},
// 	{
// 		product_id: 4,
// 		name: 'Beef Ground Mince',
// 		description:
// 			'Freshly ground beef, perfect for burgers, meatballs, or sauces.',
// 		price_per_kg: 10.99,
// 		weight_kg: 1.0,
// 		category: 'Beef',
// 		cut_type: 'Ground',
// 		availability: 'In Stock',
// 	},
// 	{
// 		product_id: 5,
// 		name: 'Lamb Chops',
// 		description:
// 			'Tender, flavorful lamb chops, great for grilling or pan-searing.',
// 		price_per_kg: 28.75,
// 		weight_kg: 0.9,
// 		category: 'Lamb',
// 		cut_type: 'Chop',
// 		availability: 'Low Stock',
// 	},
// 	{
// 		product_id: 6,
// 		name: 'Turkey Breast',
// 		description:
// 			'Lean and flavorful turkey breast, perfect for roasting or slicing.',
// 		price_per_kg: 15.0,
// 		weight_kg: 1.8,
// 		category: 'Poultry',
// 		cut_type: 'Breast',
// 		availability: 'In Stock',
// 	},
// 	{
// 		product_id: 7,
// 		name: 'Bacon Strips',
// 		description:
// 			'Smoked and crispy bacon, perfect for breakfast or as a topping.',
// 		price_per_kg: 20.99,
// 		weight_kg: 0.5,
// 		category: 'Pork',
// 		cut_type: 'Bacon',
// 		availability: 'In Stock',
// 	},
// 	{
// 		product_id: 8,
// 		name: 'Veal Shanks',
// 		description: 'Tender veal shanks, ideal for slow cooking or braising.',
// 		price_per_kg: 30.0,
// 		weight_kg: 1.0,
// 		category: 'Veal',
// 		cut_type: 'Shank',
// 		availability: 'Out of Stock',
// 	},
// 	{
// 		product_id: 9,
// 		name: 'Beef Brisket',
// 		description: 'A flavorful cut of beef, ideal for slow-cooking or smoking.',
// 		price_per_kg: 22.5,
// 		weight_kg: 3.0,
// 		category: 'Beef',
// 		cut_type: 'Brisket',
// 		availability: 'In Stock',
// 	},
// 	{
// 		product_id: 10,
// 		name: 'Sausages - Pork & Apple',
// 		description: 'A tasty blend of pork and apple in a savory sausage.',
// 		price_per_kg: 12.99,
// 		weight_kg: 0.8,
// 		category: 'Pork',
// 		cut_type: 'Sausage',
// 		availability: 'In Stock',
// 	},
// ];

export default data;
