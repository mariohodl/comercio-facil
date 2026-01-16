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

// CREATE
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
		const userCreated = await User.create({
			...user,
			password: await bcrypt.hash(user.password, 5),
			role: ROL_ADMIN, // Default to admin for new signups as they are creating a store/company
			isStore: true, // Default to true as per requirement
		});

		return { success: true, message: 'User created successfully', redirectUrl: '/admin/setup' };
	} catch (error) {
		console.log(error)
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

		// Create Company
		const company = await Company.create({
			name: validatedData.companyName,
			owner: user._id,
		});

		// Create Store
		const store = await Store.create({
			name: validatedData.storeName,
			company: company._id,
			location: validatedData.storeLocation,
			slug: validatedData.storeId || validatedData.storeName.toLowerCase().replace(/\s+/g, '-'),
		});

		// Create Warehouse
		const warehouse = await Warehouse.create({
			name: validatedData.warehouseName,
			company: company._id,
			location: validatedData.warehouseLocation,
			slug: validatedData.warehouseName.toLowerCase().replace(/\s+/g, '-'),
		});

		user.business = {
			companyId: company._id,
			stores: [store._id],
			warehouses: [warehouse._id],
			defaultStoreId: store._id
		};
		user.isStore = true;

		await user.save();

		return { success: true, message: 'Store settings updated successfully' };
	} catch (error) {
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