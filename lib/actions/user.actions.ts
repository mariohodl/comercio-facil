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
import { UserSignUpSchema, UserUpdateSchema, StoreSettingsSchema } from '../validator'
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
		const dbUser = await User.findById(user._id)
		if (!dbUser) throw new Error('User not found')
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
	const user = await User.findById(userId)
	if (!user) throw new Error('User not found')
	return JSON.parse(JSON.stringify(user)) as IUser
}

// DELETE

export async function deleteUser(id: string) {
	try {
		await connectToDatabase()
		const res = await User.findByIdAndDelete(id)
		if (!res) throw new Error('Use not found')
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
	const users = await User.find()
		.sort({ createdAt: 'desc' })
		.skip(skipAmount)
		.limit(limit)
	const usersCount = await User.countDocuments()
	return {
		data: JSON.parse(JSON.stringify(users)) as IUser[],
		totalPages: Math.ceil(usersCount / limit),
	}
}