// MUST register timezone plugin before ANY model is imported
import './setup';
import mongoose from 'mongoose';

/**
 * TZ (Timezone) Management for MongoDB
 */

/**
 * Import core models AFTER plugin registration.
 * This guarantees those schemas inherit the global plugin.
 */
import './models/store.model';
import './models/order.model';
import './models/company.model';
import './models/warehouse.model';
import './models/attribute.model';
import './models/product.model';
import './models/user.model';
import './models/customer.model';
import './models/orderReception.model';
import './models/cash-register.model';
import './models/expense.model';
import './models/proveedor.model';
import './models/category.model';
import './models/brand.model';
import './models/unit.model';
import './models/sub-category.model';

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
