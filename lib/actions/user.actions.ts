'use server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { auth, signIn, signOut } from '@/auth'
import { IUserName, IUserSignIn, IUserSignUp } from '@/types'
import { connectToDatabase } from '../db';
import User, { IUser } from '../db/models/user.model'
import Company from '../db/models/company.model'
import Store from '../db/models/store.model'
import Warehouse from '../db/models/warehouse.model'
import { formatError } from '../utils';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache'
import { PAGE_SIZE } from '../constants'
import { UserSignUpSchema, UserUpdateSchema, StoreSettingsSchema, StoreUserCreateSchema, StoreUserUpdateSchema } from '../validator'
import { ROL_CUSTOMER, ROL_ADMIN } from '@/lib/constants'

import { z } from 'zod'

export async function signInWithCredentials(user: IUserSignIn) {
	return await signIn('credentials', { ...user, redirect: false });
}
export const SignOut = async () => {
	await signOut({ redirect: false });
	redirect('/');
};

export const SignInWithGoogle = async () => {
	await signIn('google');
};

export const SignInWithFacebook = async () => {
	await signIn('facebook');
};

export const SignInWithInstagram = async () => {
	await signIn('instagram');
};

export const getSession = async () => {
	return await auth();
}

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
	try {
		const user = await UserSignUpSchema.parseAsync({
			name: userSignUp.name,
			email: userSignUp.email,
			password: userSignUp.password,
			phone: userSignUp.phone,
			confirmPassword: userSignUp.confirmPassword,
		});

		await connectToDatabase();

		// Check if user already exists
		const existingUser = await User.findOne({ email: user.email });
		if (existingUser) {
			return { success: false, error: 'Email already registered' };
		}

		const userCreated = await User.create({
			...user,
			password: await bcrypt.hash(user.password, 5),
			role: ROL_ADMIN, // Default to admin for new signups as they are creating a store/company
			isStore: true, // Default to true as per requirement
			emailVerified: false, // User needs to verify email
		});

		// Send verification email
		const { sendVerificationEmail } = await import('@/lib/email/verification');
		const emailResult = await sendVerificationEmail(user.email, user.name);

		if (!emailResult.success) {
			console.error('Failed to send verification email:', emailResult.error);
			// Still allow user creation even if email fails
		}

		return {
			success: true,
			message: 'User created successfully. Please check your email for verification code.',
			redirectUrl: `/verify-email?email=${encodeURIComponent(user.email)}`
		};
	} catch (error) {

		return { success: false, error: formatError(error) };
	}
}

export async function updateStoreSettings(data: z.infer<typeof StoreSettingsSchema>) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		const validatedData = await StoreSettingsSchema.parseAsync(data);

		await connectToDatabase();
		const user = await User.findById(session.user.id);

		if (!user) {
			throw new Error('User not found');
		}

		// Check if user already has a company to avoid duplicates
		let company;
		if (user.business?.companyId) {
			company = await Company.findById(user.business.companyId);
		}

		if (!company) {
			// Create Company
			company = await Company.create({
				name: validatedData.companyName,
				owner: user._id,
			});
		} else {
			// Update existing company name
			company.name = validatedData.companyName;
			await company.save();
		}

		// Generate unique suffixes for slugs if needed
		const shortId = Math.random().toString(36).substring(2, 6);

		// Handle Store idempotency
		let store;
		if (validatedData.storeId) {
			store = await Store.findOne({ slug: validatedData.storeId });
		}

		if (!store) {
			const storeSlug = validatedData.storeId || `${validatedData.storeName.toLowerCase().replace(/\s+/g, '-')}-${shortId}`;
			store = await Store.create({
				name: validatedData.storeName,
				company: company._id,
				location: validatedData.storeLocation,
				slug: storeSlug,
			});
		} else {
			store.name = validatedData.storeName;
			store.location = validatedData.storeLocation;
			await store.save();
		}

		// Handle Warehouse idempotency
		// Warehouse slug usually includes the storeId to be unique-ish
		const warehouseSlug = `${validatedData.warehouseName.toLowerCase().replace(/\s+/g, '-')}-${validatedData.storeId || shortId}`;

		let warehouse = await Warehouse.findOne({
			company: company._id,
			name: validatedData.warehouseName
		});

		if (!warehouse) {
			warehouse = await Warehouse.create({
				name: validatedData.warehouseName,
				company: company._id,
				location: validatedData.warehouseLocation,
				slug: warehouseSlug,
			});
		} else {
			warehouse.name = validatedData.warehouseName;
			warehouse.location = validatedData.warehouseLocation;
			await warehouse.save();
		}

		user.business = {
			companyId: company._id,
			stores: Array.from(new Set([...(user.business?.stores || []), store._id])),
			warehouses: Array.from(new Set([...(user.business?.warehouses || []), warehouse._id])),
			defaultStoreId: user.business?.defaultStoreId || store._id
		};
		user.isStore = true;

		await user.save();

		return { success: true, message: 'Store settings updated successfully' };
	} catch (error) {
		console.error('Error updating store settings:', error);
		return { success: false, error: formatError(error) };
	}
}
// UPDATE
export async function updateUserName(user: IUserName) {
	try {
		await connectToDatabase()
		const session = await auth()
		const currentUser = await User.findById(session?.user?.id)
		if (!currentUser) throw new Error('User not found')
		currentUser.name = user.name
		const updatedUser = await currentUser.save()
		return {
			success: true,
			message: 'User updated successfully',
			data: JSON.parse(JSON.stringify(updatedUser)),
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
	try {
		await connectToDatabase()
		const dbUser = await User.findOne({ _id: user._id, isDeleted: { $ne: true } })
		if (!dbUser) throw new Error('User not found')

		if (dbUser.role === ROL_ADMIN && dbUser.isStore) {
			throw new Error('Store Admin core details cannot be modified via this action')
		}

		dbUser.name = user.name
		dbUser.email = user.email
		dbUser.role = user.role
		const updatedUser = await dbUser.save()
		revalidatePath('/admin/users')
		return {
			success: true,
			message: 'User updated successfully',
			data: JSON.parse(JSON.stringify(updatedUser)),
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

export async function getUserById(userId: string) {
	await connectToDatabase()
	const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } })
	if (!user) throw new Error('User not found')
	return JSON.parse(JSON.stringify(user)) as IUser
}

// DELETE

export async function deleteUser(id: string) {
	try {
		await connectToDatabase()
		const user = await User.findOne({ _id: id, isDeleted: { $ne: true } })
		if (!user) throw new Error('User not found')

		if (user.role === ROL_ADMIN && user.isStore) {
			throw new Error('Store Admin users cannot be deleted')
		}

		user.isDeleted = true
		user.deletedAt = new Date()
		await user.save()

		revalidatePath('/admin/users')
		return {
			success: true,
			message: 'User deleted successfully',
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

// GET
export async function getAllUsers({
	limit,
	page,
}: {
	limit?: number
	page: number
}) {
	limit = limit || PAGE_SIZE
	await connectToDatabase()

	const skipAmount = (Number(page) - 1) * limit
	const users = await User.find({ isDeleted: { $ne: true } })
		.sort({ createdAt: 'desc' })
		.skip(skipAmount)
		.limit(limit)
	const usersCount = await User.countDocuments({ isDeleted: { $ne: true } })
	return {
		data: JSON.parse(JSON.stringify(users)) as IUser[],
		totalPages: Math.ceil(usersCount / limit),
	}
}

export async function getUsersByStore({
	storeId,
	limit,
	page,
	query
}: {
	storeId: string
	limit?: number
	page: number
	query?: string
}) {
	limit = limit || PAGE_SIZE
	await connectToDatabase()

	const skipAmount = (Number(page) - 1) * limit

	// Resolve store slug to ID
	const store = await Store.findOne({ slug: storeId })
	if (!store) {
		return {
			data: [],
			totalPages: 0,
		}
	}

	const filter: any = {
		'business.stores': store._id,
		isDeleted: { $ne: true }
	}

	if (query) {
		filter.$or = [
			{ name: { $regex: query, $options: 'i' } },
			{ email: { $regex: query, $options: 'i' } }
		]
	}

	const users = await User.find(filter)
		.sort({ createdAt: 'desc' })
		.skip(skipAmount)
		.limit(limit)

	const usersCount = await User.countDocuments(filter)

	return {
		data: JSON.parse(JSON.stringify(users)) as IUser[],
		totalPages: Math.ceil(usersCount / limit),
	}
}

export async function createStoreUser(data: z.infer<typeof StoreUserCreateSchema>) {
	try {
		const validatedData = StoreUserCreateSchema.parse(data)
		await connectToDatabase()

		const session = await auth()
		if (!session?.user?.id) throw new Error('Unauthorized')

		// Resolve store slug to ID
		const store = await Store.findOne({ slug: validatedData.storeId })
		if (!store) {
			return { success: false, message: 'Store not found' }
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: validatedData.email })
		if (existingUser) {
			return { success: false, message: 'User with this email already exists' }
		}

		const hashedPassword = await bcrypt.hash(validatedData.password, 5)

		const newUser = await User.create({
			name: validatedData.name,
			email: validatedData.email,
			password: hashedPassword,
			role: validatedData.role,
			phone: validatedData.phone,
			status: validatedData.status,
			isStore: false,
			business: {
				companyId: store.company,
				stores: [store._id],
				defaultStoreId: store._id
			}
		})

		revalidatePath(`/admin/${validatedData.storeId}/users`)
		return { success: true, message: 'User created successfully' }
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

export async function updateStoreUser(data: z.infer<typeof StoreUserUpdateSchema>) {
	try {
		const validatedData = StoreUserUpdateSchema.parse(data)
		await connectToDatabase()

		const session = await auth()
		if (!session?.user?.id) throw new Error('Unauthorized')

		const user = await User.findOne({ _id: validatedData._id, isDeleted: { $ne: true } })
		if (!user) throw new Error('User not found')

		// Defensive check: Store Admin users can only change their password
		if (user.role === ROL_ADMIN && user.isStore) {
			if (validatedData.password) {
				user.password = await bcrypt.hash(validatedData.password, 5)
			}
		} else {
			user.name = validatedData.name
			user.email = validatedData.email
			user.role = validatedData.role
			user.phone = validatedData.phone
			user.status = validatedData.status

			if (validatedData.password) {
				user.password = await bcrypt.hash(validatedData.password, 5)
			}
		}

		await user.save()

		if (validatedData.storeId) {
			revalidatePath(`/admin/${validatedData.storeId}/users`)
		}

		return { success: true, message: 'User updated successfully' }
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}