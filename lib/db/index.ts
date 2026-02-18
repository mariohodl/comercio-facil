import mongoose from 'mongoose';
// Import models statically to avoid ESM issues in test environment
import './models/store.model';
import './models/company.model';
import './models/warehouse.model';
import './models/attribute.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (
	MONGODB_URI = process.env.MONGODB_URI
) => {
	if (cached.conn) return cached.conn;

	if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

	cached.promise = cached.promise || mongoose.connect(MONGODB_URI);
	cached.conn = await cached.promise;

	return cached.conn;
};
