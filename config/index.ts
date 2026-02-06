import { z } from 'zod';
// Environment variable schema to ensure the app is correctly configured.

const isServer = typeof window === 'undefined';

const clientSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	NEXT_PUBLIC_APP_NAME: z.string().min(1),
	NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
	NEXT_PUBLIC_APP_SLOGAN: z.string().min(1),
	NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1),
	NEXT_PUBLIC_SERVER_URL: z.string().url().optional(),
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	NEXT_PUBLIC_APP_COPYRIGHT: z.string().optional(),
});

const serverSchema = z.object({
	// Database
	MONGODB_URI: z.string().min(1),

	// Authentication
	AUTH_SECRET: z.string().min(1),
	AUTH_TRUST_HOST: z.string().optional(),
	AUTH_GOOGLE_ID: z.string().optional(),
	AUTH_GOOGLE_SECRET: z.string().optional(),
	AUTH_FACEBOOK_ID: z.string().optional(),
	AUTH_FACEBOOK_SECRET: z.string().optional(),
	AUTH_INSTAGRAM_ID: z.string().optional(),
	AUTH_INSTAGRAM_SECRET: z.string().optional(),
	SUPER_ADMIN: z.string().email(),

	// Emails
	RESEND_API_KEY: z.string().min(1),
	EMAIL_FROM: z.string().min(1),

	// Payments (PayPal)
	PAYPAL_API_URL: z.string().url().optional(),
	PAYPAL_CLIENT_ID: z.string().optional(),
	PAYPAL_APP_SECRET: z.string().optional(),

	// Payments (Stripe)
	STRIPE_SECRET_KEY: z.string().optional(),
	STRIPE_WEBHOOK_SECRET: z.string().optional(),

	// Storage (UploadThing)
	UPLOADTHING_TOKEN_DEV: z.string().optional(),
	UPLOADTHING_TOKEN_PROD: z.string().optional(),

	// External APIs
	OPENAI_API_KEY: z.string().optional(),
	GOOGLE_API_KEY: z.string().optional(),

	// Configuration
	PAGE_SIZE: z.coerce.number().default(9),
	FREE_SHIPPING_MIN_PRICE: z.coerce.number().default(35),
	DEFAULT_PAYMENT_METHOD: z.string().default('PayPal'),
});

const envSchema = clientSchema.merge(serverSchema);

// We must explicitly list them for the client-side to see them.
const clientEnv = {
	NODE_ENV: process.env.NODE_ENV,
	NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
	NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
	NEXT_PUBLIC_APP_SLOGAN: process.env.NEXT_PUBLIC_APP_SLOGAN,
	NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
	NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
	NEXT_PUBLIC_APP_COPYRIGHT: process.env.NEXT_PUBLIC_APP_COPYRIGHT,
};

// Parse the environment variables
const _clientEnv = clientSchema.safeParse(clientEnv);
const _serverEnv = isServer ? serverSchema.safeParse(process.env) : { success: true, data: {} };

if (!_clientEnv.success || !_serverEnv.success) {
	const errors = {
		...(!_clientEnv.success ? _clientEnv.error.format() : {}),
		...(!_serverEnv.success ? (_serverEnv as any).error.format() : {}),
	};

	console.error(
		'❌ Invalid environment variables:',
		JSON.stringify(errors, null, 2)
	);
	throw new Error('Invalid environment variables. Please check your .env file.');
}

/**
 * Validated and typed environment variables.
 */
export const env = {
	..._clientEnv.data,
	..._serverEnv.data,
} as z.infer<typeof envSchema>;

/**
 * Type-safe access to process.env
 */
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		interface ProcessEnv extends z.infer<typeof envSchema> { }
	}
}
