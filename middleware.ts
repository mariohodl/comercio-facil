import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req: NextRequest) {
	const session = await auth();
	const { pathname } = req.nextUrl;

	// Exclude auth pages from redirect
	const isAuthPage = pathname.startsWith('/sign-in') ||
		pathname.startsWith('/sign-up') ||
		pathname.startsWith('/api/auth');

	// Handle role-based redirection for authenticated users
	if (session?.user?.storeId && !isAuthPage) {
		const { role, storeId } = session.user;

		if (role === 'Seller') {
			// Sellers must stay within POS, especially after login (redirect from /)
			if (!pathname.startsWith('/admin/pos') &&
				!pathname.startsWith('/api') &&
				!pathname.startsWith('/_next')) {
				const posUrl = new URL(`/admin/pos/${storeId}`, req.url);
				return NextResponse.redirect(posUrl);
			}
		} else if (role === 'Admin') {
			// Admins are redirected to their dashboard if they hit the entry points
			if (pathname === '/' || pathname === '/admin' || pathname === `/admin/${storeId}`) {
				const adminUrl = new URL(`/admin/${storeId}/overview`, req.url);
				return NextResponse.redirect(adminUrl);
			}
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
