import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Centralized route protection configuration
const AUTH_COOKIE = 'XSRF081'       // Basic auth
const FIRST_TIMER_COOKIE = 'XSRF087' // Flag for incomplete profile
const ADMIN_COOKIE = 'XSRF091'      // Admin access

const INCOMPLETE_PROFILE_REDIRECTS = [
  '/layanan/pelatihan/program/akp',
  '/layanan/pelatihan/program/perikanan',
  '/layanan/pelatihan/program/kelautan',
  '/layanan/cek-sertifikat'
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const { cookies } = request

  const isAuthenticated = cookies.get(AUTH_COOKIE)
  const isFirstTimer = cookies.get(FIRST_TIMER_COOKIE)
  const isAdmin = cookies.get(ADMIN_COOKIE)

  // 1. Prevent redirection loops for authenticated users on auth pages
  if (path === '/login' || path === '/registrasi') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 2. Protect user dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callback', path)
      return NextResponse.redirect(loginUrl)
    }

    // Force profile completion for first timers if they try to access other dashboard features
    // But exclude the edit-profile page itself to prevent loops
    if (isFirstTimer && path !== '/dashboard/edit-profile') {
      // You can add more specific redirects here if needed
    }
  }

  // 3. Mandatory Profile Completion check for public training pages
  if (isFirstTimer && path !== '/dashboard/edit-profile') {
    if (INCOMPLETE_PROFILE_REDIRECTS.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/edit-profile', request.url))
    }
  }

  // 4. Admin Protection
  if (path.startsWith('/admin') && !path.startsWith('/admin/auth')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

// Optimization: Ensure middleware only runs for relevant routes to avoid loops on system files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, icons, illustrations, font)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|illustrations|font).*)',
  ],
}

