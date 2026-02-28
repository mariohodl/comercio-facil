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
import { ROL_CUSTOMER, ROL_ADMIN, PLAN_BASIC, PLAN_STATUS_FREE_TRIAL } from '@/lib/constants'
import { sendPasswordResetEmail } from '@/lib/email/verification'
import PasswordResetToken from '../db/models/password-reset-token.model'

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
		// Honeypot check (Bot protection)
		if (userSignUp.middle_name_verification && userSignUp.middle_name_verification.trim() !== '') {
			console.warn(`Bot detected during registration attempt: ${userSignUp.email}`);
			// Return success: true but do nothing, or return a fake success message
			// to avoid letting the bot know it failed. 
			// But the user asked to "Discard the request".
			return {
				success: true,
				message: 'User created successfully. Please check your email for verification code.'
			};
		}

		const user = await UserSignUpSchema.parseAsync({
			name: userSignUp.name,
			email: userSignUp.email,
			password: userSignUp.password,
			phone: userSignUp.phone,
			confirmPassword: userSignUp.confirmPassword,
			promoCode: userSignUp.promoCode,
			middle_name_verification: userSignUp.middle_name_verification,
		});

		await connectToDatabase();

		// Check if user already exists
		const existingUser = await User.findOne({ email: user.email });
		if (existingUser) {
			return { success: false, error: 'Email already registered' };
		}

		const trialStartDate = new Date();
		const trialEndDate = new Date();
		trialEndDate.setMonth(trialEndDate.getMonth() + 1); // 1 month free by default

		const userCreated = await User.create({
			...user,
			password: await bcrypt.hash(user.password, 5),
			role: ROL_ADMIN, // Default to admin for new signups as they are creating a store/company
			isStore: true, // Default to true as per requirement
			emailVerified: false, // User needs to verify email
			promoCode: user.promoCode,
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
	} catch (error: any) {
		if (error.code === 11000) {
			return { success: false, error: 'Email already registered' };
		}
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
			const trialStartDate = new Date();
			const trialEndDate = new Date();

			// Check for specialized promo code
			let freeMonths = 1;
			if (user.promoCode === 'EXITO2026' || user.promoCode === 'PROMO2M') {
				freeMonths = 3; // 2 extra months + 1 base month = 3 months total
			}

			trialEndDate.setMonth(trialEndDate.getMonth() + freeMonths);

			// Create Company
			company = await Company.create({
				name: validatedData.companyName,
				owner: user._id,
				industry: validatedData.industry || 'general',
				plan: validatedData.plan || PLAN_BASIC,
				planStatus: PLAN_STATUS_FREE_TRIAL,
				trialStartDate,
				trialEndDate,
				freeMonths,
			});
		} else {
			// Update existing company name
			company.name = validatedData.companyName;
			company.taxId = validatedData.taxId;
			company.industry = validatedData.industry || company.industry || 'general';

			// Handle legacy companies without billing info
			if (!company.plan) {
				const trialStartDate = new Date();
				const trialEndDate = new Date();
				trialEndDate.setMonth(trialEndDate.getMonth() + 1);

				company.plan = PLAN_BASIC;
				company.planStatus = PLAN_STATUS_FREE_TRIAL;
				company.trialStartDate = trialStartDate;
				company.trialEndDate = trialEndDate;
				company.freeMonths = 1;
			}

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

		return {
			success: true,
			message: 'Store settings updated successfully',
			data: {
				companyId: company._id.toString(),
				companyName: company.name,
				storeId: store.slug,
				storeName: store.name,
			}
		};
	} catch (error) {
		console.error('Error updating store settings:', error);
		return { success: false, error: formatError(error) };
	}
}

export async function getStoreSettings() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		await connectToDatabase();
		const user = await User.findById(session.user.id);
		if (!user) {
			throw new Error('User not found');
		}

		if (!user.business?.companyId) {
			return { success: false, error: 'No company found' };
		}

		const company = await Company.findById(user.business.companyId);
		const store = await Store.findById(user.business.defaultStoreId);

		// Get the warehouse associated with this store or company
		let warehouse = await Warehouse.findOne({ company: company?._id });

		return {
			success: true,
			data: {
				companyName: company?.name || '',
				storeName: store?.name || '',
				storeLocation: store?.location || '',
				warehouseName: warehouse?.name || '',
				warehouseLocation: warehouse?.location || '',
				storeId: store?.slug || '',
				taxId: company?.taxId || '',
				industry: company?.industry || 'general',
				plan: company?.plan || 'BASIC',
				planStatus: company?.planStatus || 'FREE_TRIAL',
				trialEndDate: company?.trialEndDate ? company.trialEndDate.toISOString() : null,
				subscriptionEndDate: company?.subscriptionEndDate ? company.subscriptionEndDate.toISOString() : null,
			}
		};
	} catch (error) {
		console.error('Error fetching store settings:', error);
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

		// Handle missing email/password for Sellers
		let finalEmail = validatedData.email;
		if (validatedData.role === 'Seller' && (!finalEmail || finalEmail === '')) {
			// Generate a unique internal email: name_shortid@store.cf
			const shortId = Math.random().toString(36).substring(2, 6);
			finalEmail = `${validatedData.name.toLowerCase().replace(/\s+/g, '_')}_${shortId}@${store.slug}.cf`;
		}

		let finalPassword = validatedData.password;
		if (validatedData.role === 'Seller' && (!finalPassword || finalPassword === '')) {
			finalPassword = uuidv4(); // Random secure password
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: finalEmail })
		if (existingUser) {
			return { success: false, message: 'User with this email already exists' }
		}

		const hashedPassword = await bcrypt.hash(finalPassword!, 5)
		const hashedPin = validatedData.pin ? await bcrypt.hash(validatedData.pin, 5) : undefined;

		const newUser = await User.create({
			name: validatedData.name,
			email: finalEmail,
			password: hashedPassword,
			pin: hashedPin,
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
		if (user.role === 'Admin' && user.isStore) {
			if (validatedData.password) {
				user.password = await bcrypt.hash(validatedData.password, 5)
			}
		} else {
			user.name = validatedData.name
			if (validatedData.email) user.email = validatedData.email
			user.role = validatedData.role
			if (validatedData.phone) user.phone = validatedData.phone
			if (validatedData.status !== undefined) user.status = validatedData.status

			if (validatedData.password) {
				user.password = await bcrypt.hash(validatedData.password, 5)
			}

			if (validatedData.pin) {
				user.pin = await bcrypt.hash(validatedData.pin, 5)
			}
		}

		await user.save()

		if (validatedData.storeId) {
			revalidatePath(`/admin/${validatedData.storeId as string}/users`)
		}

		return { success: true, message: 'User updated successfully' }
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}
export async function updateCompanyLogo(imageUrl: string) {
	try {
		await connectToDatabase()
		const session = await auth()
		if (!session?.user?.id) throw new Error('Unauthorized')

		const user = await User.findById(session.user.id)
		if (!user) throw new Error('User not found')

		if (!user.business?.companyId) throw new Error('No company found')

		const company = await Company.findById(user.business.companyId)
		if (!company) throw new Error('Company not found')

		// Get update history (default to empty array if not exists)
		const updateHistory = company.logoUpdateHistory || []

		// Calculate date 6 months ago
		const sixMonthsAgo = new Date()
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

		// Filter updates within the last 6 months
		const recentUpdates = updateHistory.filter((date: Date) => new Date(date) > sixMonthsAgo)

		// Check if company has reached the limit
		if (recentUpdates.length >= 3) {
			const oldestUpdate = new Date(Math.min(...recentUpdates.map((d: Date) => new Date(d).getTime())))
			const nextAllowedDate = new Date(oldestUpdate)
			nextAllowedDate.setMonth(nextAllowedDate.getMonth() + 6)

			return {
				success: false,
				error: 'LIMIT_REACHED',
				remainingUpdates: 0,
				nextAvailableDate: nextAllowedDate.toISOString()
			}
		}

		// Update the company logo
		company.logo = imageUrl

		// Add current date to update history
		company.logoUpdateHistory = [...updateHistory, new Date()]

		await company.save()

		revalidatePath('/admin/[store]/settings')

		return {
			success: true,
			message: 'Company logo updated successfully',
			remainingUpdates: 3 - (recentUpdates.length + 1)
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

export async function getCompanyLogoUpdateInfo() {
	try {
		await connectToDatabase()
		const session = await auth()
		if (!session?.user?.id) throw new Error('Unauthorized')

		const user = await User.findById(session.user.id)
		if (!user) throw new Error('User not found')

		if (!user.business?.companyId) throw new Error('No company found')

		const company = await Company.findById(user.business.companyId)
		if (!company) throw new Error('Company not found')

		const updateHistory = company.logoUpdateHistory || []
		const sixMonthsAgo = new Date()
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

		const recentUpdates = updateHistory.filter((date: Date) => new Date(date) > sixMonthsAgo)
		const remainingUpdates = Math.max(0, 3 - recentUpdates.length)

		let nextAvailableDate: Date | null = null
		if (recentUpdates.length >= 3) {
			const oldestUpdate = new Date(Math.min(...recentUpdates.map((d: Date) => new Date(d).getTime())))
			nextAvailableDate = new Date(oldestUpdate)
			nextAvailableDate.setMonth(nextAvailableDate.getMonth() + 6)
		}

		return {
			success: true,
			data: {
				remainingUpdates,
				totalUpdates: recentUpdates.length,
				nextAvailableDate: nextAvailableDate ? nextAvailableDate.toISOString() : null,
				currentImage: company.logo || null
			}
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

export async function requestPasswordReset(email: string) {
	try {
		await connectToDatabase();
		const user = await User.findOne({ email, isDeleted: { $ne: true } });

		if (!user) {
			// Don't reveal if user doesn't exist for security
			return { success: true, message: 'Si el correo existe, recibirás un enlace de recuperación.' };
		}

		// Use await import to avoid dynamic import issues if any
		const { sendPasswordResetEmail } = await import('@/lib/email/verification');
		const result = await sendPasswordResetEmail(user.email, user.name);
		return result;
	} catch (error) {
		console.error('Error in requestPasswordReset:', error);
		return { success: false, error: 'Ocurrió un error al procesar tu solicitud.' };
	}
}

export async function resetPassword(data: any) {
	try {
		const { token, email, password, confirmPassword } = data;

		if (password !== confirmPassword) {
			return { success: false, error: 'Las contraseñas no coinciden.' };
		}

		if (password.length < 3) {
			return { success: false, error: 'La contraseña debe tener al menos 3 caracteres.' };
		}

		await connectToDatabase();

		// Validate token
		const resetToken = await PasswordResetToken.findOne({
			email,
			token,
			expiresAt: { $gt: new Date() },
		});

		if (!resetToken) {
			return { success: false, error: 'El enlace ha expirado o no es válido.' };
		}

		// Update user password
		const user = await User.findOne({ email });
		if (!user) {
			return { success: false, error: 'Usuario no encontrado.' };
		}

		user.password = await bcrypt.hash(password, 5);
		await user.save();

		// Delete token
		await PasswordResetToken.deleteOne({ _id: resetToken._id });

		return { success: true, message: 'Tu contraseña ha sido actualizada con éxito.' };
	} catch (error) {
		console.error('Error in resetPassword:', error);
		return { success: false, error: 'Ocurrió un error al restablecer tu contraseña.' };
	}
}
