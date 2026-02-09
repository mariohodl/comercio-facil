import mongoose from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (
	MONGODB_URI = process.env.MONGODB_URI
) => {
	if (cached.conn) return cached.conn;

	if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

	cached.promise = cached.promise || mongoose.connect(MONGODB_URI);
	cached.conn = await cached.promise;

	// Registration of core models to ensure they are available for population across serverless function executions.
	if (cached.conn && !mongoose.models.Store) {
		await import('./models/store.model');
		await import('./models/company.model');
		await import('./models/warehouse.model');
		await import('./models/attribute.model');
	}

	return cached.conn;
};
