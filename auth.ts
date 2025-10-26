import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { connectToDatabase } from './lib/db';
import client from './lib/db/client';
import User from './lib/db/models/user.model';

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
		} & DefaultSession['user'];
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	pages: {
		signIn: '/sign-in',
		newUser: '/sign-up',
		error: '/sign-in',
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

				const DBuser = await User.findOne({ email: credentials.email });

				if (DBuser && DBuser.password) {
					const isMatch = await bcrypt.compare(
						credentials.password as string,
						DBuser.password
					);
					if (isMatch) {
						const user = {
							id: DBuser._id,
							name: DBuser.name,
							email: DBuser.email,
							role: DBuser.role,
							storeId: DBuser.storeId,
							isStore: DBuser.isStore,
							storeName: DBuser.storeName
						};
						return user
					}
				}
				return null;
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user, trigger, session }) => {
			if (user) {
				if (!user.name) {
					await connectToDatabase();
					await User.findByIdAndUpdate(user.id, {
						name: user.name || user.email!.split('@')[0],
						role: 'user',
					});
				}
				token.name = user.name || user.email!.split('@')[0];
				token.role = (user as { role: string }).role;
				token.storeId = (user as { storeId: string }).storeId;
				token.storeName = (user as { storeName: string }).storeName;
				token.isStore = (user as { isStore: boolean }).isStore;
			}

			if (session?.user?.name && trigger === 'update') {
				token.name = session.user.name;
			}
			return token;
		},
		session: async ({ session, user, trigger, token }) => {
			session.user.id = token.sub as string;
			session.user.role = token.role as string;
			session.user.name = token.name;

			session.user.storeId = token.storeId as string;
			session.user.isStore = token.isStore as boolean;
			session.user.storeName = token.storeId as string;

			if (trigger === 'update') {
				session.user.name = user.name;
			}
			return session;
		},
	},
});
