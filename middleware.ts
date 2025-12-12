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

	// If user is a seller, redirect to their POS page
	if (session?.user?.role === 'Seller' && session?.user?.storeId && !isAuthPage) {
		// Don't redirect if already on POS page, API routes, or static files
		if (!pathname.startsWith('/admin/pos') &&
			!pathname.startsWith('/api') &&
			!pathname.startsWith('/_next') &&
			pathname !== '/') {
			// Redirect to POS page for their store
			const posUrl = new URL(`/admin/pos/${session.user.storeId}`, req.url);
			return NextResponse.redirect(posUrl);
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
