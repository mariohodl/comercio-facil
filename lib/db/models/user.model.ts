import { IUserInput } from '@/types';
import { ROL_CUSTOMER } from '@/lib/constants'
import {
	Document,
	// InferSchemaType,
	Model,
	model,
	models,
	Schema,
} from 'mongoose';

export interface IUser extends Document, IUserInput {
	_id: string;
	business?: {
		companyId: string;
		stores: string[];
		warehouses: string[];
		defaultStoreId: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		role: { type: String, required: true, default: ROL_CUSTOMER },
		password: { type: String },
		image: { type: String },
		emailVerified: { type: Boolean, default: false },
		isStore: { type: Boolean, default: false },
		business: {
			companyId: { type: Schema.Types.ObjectId as any, ref: 'Company' },
			stores: [{ type: Schema.Types.ObjectId as any, ref: 'Store' }],
			warehouses: [{ type: Schema.Types.ObjectId as any, ref: 'Warehouse' }],
			defaultStoreId: { type: Schema.Types.ObjectId as any, ref: 'Store' }
		}
	},
	{
		timestamps: true,
	}
);

const User = (models.User as Model<IUser>) || model<IUser>('User', userSchema);

export default User;
