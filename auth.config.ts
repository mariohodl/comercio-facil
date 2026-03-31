import type { NextAuthConfig } from 'next-auth';

// Notice this is only an object, not a full Auth.js instance
export default {
	providers: [],
	pages: {
		signIn: '/sign-in',
		newUser: '/sign-up',
		error: '/sign-in',
	},
	callbacks: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		authorized({ request, auth }: any) {
			const protectedPaths = [
				/\/checkout(\/.*)?/,
				/\/account(\/.*)?/,
				/\/admin(\/.*)?/,
			];
			const { pathname } = request.nextUrl;
			if (protectedPaths.some((p) => p.test(pathname))) return !!auth;
			return true;
		},
		// These callbacks are needed here so middleware can read custom session data
		jwt: async ({ token, user, trigger, session }: any) => {
			if (user) {
				token.name = user.name || user.email!.split('@')[0];
				token.role = user.role;
				token.storeId = user.storeId;
				token.storeName = user.storeName;
				token.isStore = user.isStore;
				token.phone = user.phone;
				token.phoneVerified = user.phoneVerified;
				token.companyId = user.companyId;
				token.companyName = user.companyName;
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
			if (session?.user?.phone !== undefined && trigger === 'update') {
				token.phone = session.user.phone;
			}
			if (session?.user?.phoneVerified !== undefined && trigger === 'update') {
				token.phoneVerified = session.user.phoneVerified;
			}
			return token;
		},
		session: async ({ session, token }: any) => {
			session.user.id = token.sub;
			session.user.role = token.role;
			session.user.name = token.name;
			session.user.storeId = token.storeId;
			session.user.isStore = token.isStore;
			session.user.storeName = token.storeName;
			session.user.companyId = token.companyId;
			session.user.companyName = token.companyName;
			session.user.phone = token.phone || '';
			session.user.phoneVerified = !!token.phoneVerified;

			return session;
		},
	},
} satisfies NextAuthConfig;
