import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
	const session = req.auth;
	const { pathname } = req.nextUrl;

	// protected paths
	const isProtectedPath =
		pathname.startsWith('/admin') ||
		pathname.includes('/super-admin') ||
		pathname.startsWith('/checkout') ||
		pathname.startsWith('/account');

	// Redirect unauthenticated users to login for protected paths
	if (!session && isProtectedPath) {
		const loginUrl = new URL('/sign-in', req.url);
		loginUrl.searchParams.set('callbackUrl', encodeURI(req.url));
		return NextResponse.redirect(loginUrl);
	}

	// Handle role-based redirection for authenticated users
	if (session?.user) {
		const { role, storeId } = session.user;

		// SuperAdmin isolation (Strictly verify access to root super-admin paths)
		if (pathname.startsWith('/super-admin') && role !== 'SuperAdmin') {
			const redirectUrl = storeId ? `/admin/${storeId}/overview` : '/';
			return NextResponse.redirect(new URL(redirectUrl, req.url));
		}

		const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

		// Redirect to setup if no storeId (Exempt SuperAdmin)
		if (!storeId && role !== 'SuperAdmin' && pathname !== '/admin/setup' && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
			const setupUrl = new URL('/admin/setup', req.url);
			return NextResponse.redirect(setupUrl);
		}

		// Redirections when storeId exists
		if (storeId) {
			if (role === 'Seller') {
				// Sellers must stay within POS
				if (!pathname.startsWith('/admin/pos') &&
					!pathname.startsWith('/api') &&
					!pathname.startsWith('/_next')) {
					const posUrl = new URL(`/admin/pos/${storeId}`, req.url);
					return NextResponse.redirect(posUrl);
				}
			} else if (role === 'Admin' || role === 'SuperAdmin') {
				if (pathname === '/' || pathname === '/admin' || pathname === `/admin/${storeId}`) {
					const targetPath = role === 'SuperAdmin' ? '/super-admin' : `/admin/${storeId}/overview`;
					return NextResponse.redirect(new URL(targetPath, req.url));
				}
			}
		}

		if (isAuthPage) {
			const redirectUrl = storeId ? `/admin/${storeId}/overview` : '/';
			return NextResponse.redirect(new URL(redirectUrl, req.url));
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * 
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
