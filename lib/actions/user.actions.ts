'use server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { auth, signIn, signOut } from '@/auth'
import { IUserName, IUserSignIn, IUserSignUp } from '@/types'
import { connectToDatabase } from '../db';
import User, { IUser } from '../db/models/user.model'
import { formatError } from '../utils';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache'
import { PAGE_SIZE } from '../constants'
import { UserSignUpSchema, UserUpdateSchema } from '../validator'
import { ROL_CUSTOMER, ROL_SELLER } from '@/lib/constants'

import { z } from 'zod'

export async function signInWithCredentials(user: IUserSignIn) {
	return await signIn('credentials', { ...user, redirect: false });
}
export const SignOut = async () => {
	const redirectTo = await signOut({ redirect: false });

	redirect(redirectTo.redirect);
};

export const SignInWithGoogle = async () => {
	await signIn('google');
};

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
	try {
		const user = await UserSignUpSchema.parseAsync({
			name: userSignUp.name,
			email: userSignUp.email,
			password: userSignUp.password,
			confirmPassword: userSignUp.confirmPassword,
			isStore: userSignUp.isStore,
			storeName: userSignUp.storeName,
			storeId: uuidv4().toString().substring(0, 8),
			role: userSignUp.isStore ? ROL_SELLER : ROL_CUSTOMER 
		});

		await connectToDatabase();
		const userCreated = await User.create({
			...user,
			password: await bcrypt.hash(user.password, 5),
		});
		console.log(userCreated)
		const userInfo = {
			storeId: userCreated.storeId,
			email: userCreated.email,
			isStore: userCreated.isStore,
			name: userCreated.name,
			role: userCreated.role
		}
		const redirectUrl = userCreated.isStore ? `/${userCreated.storeId}/dashboard` : '/'
		
		return { success: true, message: 'User created successfully' , userInfo, redirectUrl};
	} catch (error) {
		console.log(error)
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