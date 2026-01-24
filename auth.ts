import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Instagram from 'next-auth/providers/instagram';
import { connectToDatabase } from './lib/db';
import client from './lib/db/client';
import User from './lib/db/models/user.model';
import { ROL_ADMIN } from './lib/constants';

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
		} & DefaultSession['user'];
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
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
			allowDangerousEmailAccountLinking: true,
		}),
		Instagram({
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
					.populate('business.companyId');

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
							companyName: company?.name || ''
						};
						return user
					}
				}
				return null;
			},
		}),
	],
	events: {
		async createUser({ user }) {
			// For all social providers (anything that's not credentials), we mark as verified
			// and give them the admin role by default since they are signing up to create a store
			await connectToDatabase();
			await User.findOneAndUpdate({ email: user.email }, {
				emailVerified: true,
				role: ROL_ADMIN,
				isStore: true,
			});
		},
	},
	callbacks: {
		signIn: async ({ user, account }) => {
			if (account?.provider !== 'credentials') {
				await connectToDatabase();
				const dbUser = await User.findOne({ email: user.email });
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
		},
		jwt: async ({ token, user, trigger, session }) => {
			if (user) {
				const u = user as any;
				// For credentials, storeId is already passed. For social login via adapter, it's not.
				if (!u.storeId && user.email) {
					await connectToDatabase();
					const dbUser = await User.findOne({ email: user.email })
						.populate('business.defaultStoreId')
						.populate('business.companyId');
					if (dbUser) {
						const defaultStore = dbUser.business?.defaultStoreId as any;
						const company = dbUser.business?.companyId as any;
						token.role = dbUser.role || ROL_ADMIN;
						token.storeId = defaultStore?.slug || '';
						token.storeName = defaultStore?.name || '';
						token.isStore = !!dbUser.isStore;
						token.companyId = company?._id?.toString() || '';
						token.companyName = company?.name || '';
					}
				} else {
					token.role = u.role || ROL_ADMIN;
					token.storeId = u.storeId || '';
					token.storeName = u.storeName || '';
					token.isStore = !!u.isStore;
					token.companyId = u.companyId || '';
					token.companyName = u.companyName || '';
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
			return token;
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

			if (trigger === 'update') {
				session.user.name = user.name;
				session.user.storeId = token.storeId as string;
				session.user.storeName = token.storeName as string;
				session.user.isStore = token.isStore as boolean;
				session.user.companyId = token.companyId as string;
				session.user.companyName = token.companyName as string;
			}
			return session;
		},
	},
});
