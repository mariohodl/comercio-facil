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
		const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

		// 1. Redirect to setup if no storeId (and user is Admin/Store owner)
		if (!storeId && pathname !== '/admin/setup' && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
			const setupUrl = new URL('/admin/setup', req.url);
			return NextResponse.redirect(setupUrl);
		}

		// 2. Redirections when storeId exists
		if (storeId) {
			if (role === 'Seller') {
				// Sellers must stay within POS
				if (!pathname.startsWith('/admin/pos') &&
					!pathname.startsWith('/api') &&
					!pathname.startsWith('/_next')) {
					const posUrl = new URL(`/admin/pos/${storeId}`, req.url);
					return NextResponse.redirect(posUrl);
				}
			} else if (role === 'Admin') {
				// Admins are redirected to their dashboard if they hit the entry points
				if (pathname === '/' || pathname === '/admin' || (pathname === `/admin/${storeId}`)) {
					const adminUrl = new URL(`/admin/${storeId}/overview`, req.url);
					return NextResponse.redirect(adminUrl);
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
