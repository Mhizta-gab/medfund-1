import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isTraditionalLoginPage = request.nextUrl.pathname === '/traditional-login';
  const isRegisterPage = request.nextUrl.pathname === '/register';
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  
  // Special case for profile page which can be accessed with wallet auth
  const isProfilePage = request.nextUrl.pathname === '/profile';
  
  // Paths that can be accessed with wallet auth or without traditional auth
  const walletAuthPaths = ['/profile', '/create-campaign', '/campaigns'];
  const isWalletAuthPath = walletAuthPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );

  // If user is not authenticated with cookies and trying to access protected routes
  // that are not wallet-auth enabled
  if (!userCookie && !isLoginPage && !isRegisterPage && !isTraditionalLoginPage && !isWalletAuthPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login/register pages
  if (userCookie && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Admin route protection - requires traditional auth
  if (isAdminPage) {
    if (!userCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const userData = JSON.parse(userCookie.value);
      if (userData.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      // Invalid cookie, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('user');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 