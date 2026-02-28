import { MongoDBAdapter } from '@auth/mongodb-adapter';
import * as bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Instagram from 'next-auth/providers/instagram';
import { connectToDatabase } from './lib/db';
import client from './lib/db/client';
import User from './lib/db/models/user.model';
import Store from './lib/db/models/store.model';
import Company from './lib/db/models/company.model';
import { ROL_ADMIN } from './lib/constants';
import { cookies } from 'next/headers';
import { MOCK_SELLERS, MOCK_ADMIN } from './lib/mocks/data';

import NextAuth, { type DefaultSession } from 'next-auth';
import authConfig from './auth.config';

declare module 'next-auth' {
	// eslint-disable-next-line no-unused-vars
	interface Session {
		user: {
			role: string;
			storeId: string;
			isStore: boolean;
			storeName: string;
			companyId: string;
			companyName: string;
			plan: string;
			planStatus: string;
			trialEndDate?: string;
		} & DefaultSession['user'];
	}

	interface JWT {
		role: string;
		storeId: string;
		isStore: boolean;
		storeName: string;
		companyId: string;
		companyName: string;
		plan: string;
		planStatus: string;
		trialEndDate: string;
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	trustHost: true,
	cookies: {
		// Explicit cookie config to fix Brave/Firefox PKCE issue
		// Brave's Shields can drop cookies during OAuth redirect chains
		pkceCodeVerifier: {
			name: 'authjs.pkce.code_verifier',
			options: {
				httpOnly: true,
				sameSite: 'lax' as const,
				path: '/',
				secure: process.env.NODE_ENV === 'production',
			},
		},
		state: {
			name: 'authjs.state',
			options: {
				httpOnly: true,
				sameSite: 'lax' as const,
				path: '/',
				secure: process.env.NODE_ENV === 'production',
			},
		},
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60,
	},
	adapter: MongoDBAdapter(client),

	providers: [
		Google({
			allowDangerousEmailAccountLinking: true,
		}),
		Facebook({
			clientId: process.env.AUTH_FACEBOOK_ID,
			clientSecret: process.env.AUTH_FACEBOOK_SECRET,
			allowDangerousEmailAccountLinking: true,
		}),
		Instagram({
			clientId: process.env.AUTH_INSTAGRAM_ID,
			clientSecret: process.env.AUTH_INSTAGRAM_SECRET,
			allowDangerousEmailAccountLinking: true,
		}),
		CredentialsProvider({
			credentials: {
				email: {
					type: 'email',
				},
				password: { type: 'password' },
			},
			async authorize(credentials) {
				await connectToDatabase();
				if (credentials == null) return null;

				const DBuser = await User.findOne({ email: credentials.email, isDeleted: { $ne: true } })
					.populate('business.defaultStoreId')
					.populate('business.companyId') as any;

				if (DBuser && DBuser.password) {
					const isMatch = await bcrypt.compare(
						credentials.password as string,
						DBuser.password
					);
					if (isMatch) {
						const defaultStore = DBuser.business?.defaultStoreId as any;
						const company = DBuser.business?.companyId as any;
						const user = {
							id: DBuser._id.toString(),
							name: DBuser.name,
							email: DBuser.email,
							role: DBuser.role,
							storeId: defaultStore?.slug || '',
							isStore: DBuser.isStore,
							storeName: defaultStore?.name || '',
							companyId: company?._id?.toString() || '',
							companyName: company?.name || '',
							plan: company?.plan || '',
							planStatus: company?.planStatus || '',
							trialEndDate: company?.trialEndDate?.toISOString() || '',
						};
						return user
					}
				}

				// Fallback to MOCK_ADMIN
				if (credentials.email === MOCK_ADMIN.email && credentials.password === MOCK_ADMIN.password) {
					return {
						id: '65abc0000000000000000000',
						name: MOCK_ADMIN.name,
						email: MOCK_ADMIN.email,
						role: MOCK_ADMIN.role,
						storeId: 'demo-store',
						isStore: true,
						storeName: 'Tienda Demo',
						companyId: 'demo-company',
						companyName: 'Empresa Demo',
						plan: 'pro',
						planStatus: 'active',
					};
				}

				return null;
			},
		}),
		// PIN-based authentication for Seller role
		CredentialsProvider({
			id: 'pin',
			name: 'PIN',
			credentials: {
				pin: { type: 'text' },
				userId: { type: 'text' },
			},
			async authorize(credentials) {
				if (!credentials?.pin || !credentials?.userId) return null;

				// Fallback to MOCK_SELLERS for testing/offline mode
				const mockSeller = MOCK_SELLERS.find(s => s._id === credentials.userId);
				if (mockSeller) {
					if (mockSeller.pin === credentials.pin) {
						return {
							id: mockSeller._id,
							name: mockSeller.name,
							email: mockSeller.email,
							role: mockSeller.role,
							storeId: 'demo-store',
							isStore: true,
							storeName: 'Tienda Demo',
							companyId: 'demo-company',
							companyName: 'Empresa Demo',
							plan: 'pro',
							planStatus: 'active',
						};
					}
					return null; // Incorrect PIN for mock seller, stop here.
				}

				await connectToDatabase();

				const DBuser = await User.findOne({
					_id: credentials.userId,
					isDeleted: { $ne: true },
					status: true,
				})
					.populate('business.defaultStoreId')
					.populate('business.companyId') as any;

				if (!DBuser || !DBuser.pin) {
					return null;
				}

				const isMatch = await bcrypt.compare(
					credentials.pin as string,
					DBuser.pin
				);
				if (!isMatch) return null;

				const defaultStore = DBuser.business?.defaultStoreId as any;
				const company = DBuser.business?.companyId as any;
				return {
					id: DBuser._id.toString(),
					name: DBuser.name,
					email: DBuser.email,
					role: DBuser.role,
					storeId: defaultStore?.slug || '',
					isStore: DBuser.isStore,
					storeName: defaultStore?.name || '',
					companyId: company?._id?.toString() || '',
					companyName: company?.name || '',
					plan: company?.plan || '',
					planStatus: company?.planStatus || '',
					trialEndDate: company?.trialEndDate?.toISOString() || '',
				};
			},
		}),
	],
	events: {
		async createUser({ user }) {
			try {
				// For all social providers (anything that's not credentials), we mark as verified
				// and give them the admin role by default since they are signing up to create a store
				await connectToDatabase();
				let promoCode;
				try {
					const cookieStore = await cookies();
					promoCode = cookieStore.get('promo_code')?.value;
				} catch (e) {
					// safe to ignore, likely out of req context
				}

				await User.findOneAndUpdate({ email: user.email }, {
					emailVerified: true,
					role: ROL_ADMIN,
					isStore: true,
					promoCode: promoCode || undefined,
				});
			} catch (error) {
				console.error("Error in createUser event:", error);
			}
		},
	},
	callbacks: {
		signIn: async ({ user, account }) => {
			try {
				if (account?.provider !== 'credentials') {
					await connectToDatabase();
					const dbUser = await User.findOne({ email: user.email }) as any;
					if (dbUser && !dbUser.emailVerified) {
						dbUser.emailVerified = true;
						// Also set admin role if they are new or didn't have a specific role
						if (dbUser.role === 'Customer' || !dbUser.role) {
							dbUser.role = ROL_ADMIN;
							dbUser.isStore = true;
						}
						await dbUser.save();
					}
				}
				return true;
			} catch (error) {
				// console.error('SignIn callback error:', error);
				return true; // Still allow sign in if role update fails
			}
		},
		jwt: async ({ token, user, trigger, session }) => {
			try {
				if (user) {
					const u = user as any;
					// For credentials, storeId is already passed. For social login via adapter, it's not.
					if (!u.storeId && user.email) {
						await connectToDatabase();

						const dbUser = await User.findOne({ email: user.email })
							.populate('business.defaultStoreId')
							.populate('business.companyId') as any;

						if (dbUser) {
							token.role = dbUser.role || ROL_ADMIN;
							token.isStore = !!dbUser.isStore;

							const defaultStore = dbUser.business?.defaultStoreId;
							const company = dbUser.business?.companyId;

							token.storeId = defaultStore?.slug || '';
							token.storeName = defaultStore?.name || '';
							token.companyId = company?._id?.toString() || '';
							token.companyName = company?.name || '';
							token.plan = company?.plan || '';
							token.planStatus = company?.planStatus || '';

							// Safely handle dates
							const trialEndDate = (company as any)?.trialEndDate;
							if (trialEndDate instanceof Date) {
								token.trialEndDate = trialEndDate.toISOString();
							} else if (trialEndDate) {
								token.trialEndDate = new Date(trialEndDate).toISOString();
							} else {
								token.trialEndDate = '';
							}
						}
					} else {
						token.role = u.role || ROL_ADMIN;
						token.storeId = u.storeId || '';
						token.storeName = u.storeName || '';
						token.isStore = !!u.isStore;
						token.companyId = u.companyId || '';
						token.companyName = u.companyName || '';
						token.plan = u.plan || '';
						token.planStatus = u.planStatus || '';
						token.trialEndDate = u.trialEndDate || '';
					}
					token.name = user.name || user.email!.split('@')[0];
					token.sub = user.id;
				}

				if (session?.user?.name && trigger === 'update') {
					token.name = session.user.name;
				}
				if (session?.user?.storeId && trigger === 'update') {
					token.storeId = session.user.storeId;
				}
				if (session?.user?.storeName && trigger === 'update') {
					token.storeName = session.user.storeName;
				}
				if (session?.user?.isStore !== undefined && trigger === 'update') {
					token.isStore = session.user.isStore;
				}
				if (session?.user?.companyId && trigger === 'update') {
					token.companyId = session.user.companyId;
				}
				if (session?.user?.companyName && trigger === 'update') {
					token.companyName = session.user.companyName;
				}
				if (session?.user?.plan && trigger === 'update') {
					token.plan = session.user.plan;
				}
				if (session?.user?.planStatus && trigger === 'update') {
					token.planStatus = session.user.planStatus;
				}
				if (session?.user?.trialEndDate && trigger === 'update') {
					token.trialEndDate = session.user.trialEndDate;
				}
				return token;
			} catch (error) {
				// console.error('JWT callback error:', error);
				return token;
			}
		},
		session: async ({ session, user, trigger, token }) => {
			session.user.id = token.sub as string;
			session.user.role = token.role as string;
			session.user.name = token.name;

			session.user.storeId = token.storeId as string;
			session.user.isStore = token.isStore as boolean;
			session.user.storeName = token.storeName as string;
			session.user.companyId = token.companyId as string;
			session.user.companyName = token.companyName as string;
			session.user.plan = token.plan as string;
			session.user.planStatus = token.planStatus as string;
			session.user.trialEndDate = token.trialEndDate as string;

			if (trigger === 'update') {
				session.user.name = user.name;
				session.user.storeId = token.storeId as string;
				session.user.storeName = token.storeName as string;
				session.user.isStore = token.isStore as boolean;
				session.user.companyId = token.companyId as string;
				session.user.companyName = token.companyName as string;
				session.user.plan = token.plan as string;
				session.user.planStatus = token.planStatus as string;
				session.user.trialEndDate = token.trialEndDate as string;
			}
			return session;
		},
	},
});
