import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Centralized route protection configuration
const AUTH_COOKIE = 'XSRF081'       // Basic auth
const PROFILE_COOKIE = 'XSRF087'    // Profile status
const ADMIN_COOKIE = 'XSRF091'      // Admin access

const PROTECTED_USER_ROUTES = ['/dashboard/edit-profile', '/dashboard']
const PUBLIC_ONLY_ROUTES = ['/registrasi', '/login']
const INCOMPLETE_PROFILE_REDIRECTS = [
  '/',
  '/layanan/pelatihan/program/akp',
  '/layanan/pelatihan/program/perikanan',
  '/layanan/pelatihan/program/kelautan',
  '/layanan/cek-sertifikat'
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const { cookies } = request

  // 1. Force HTTPS in production
  if (process.env.NEXT_PUBLIC_NODE_ENV === 'production' && request.headers.get("x-forwarded-proto") === "http") {
    return NextResponse.redirect(`https://${request.headers.get("host")}${path}`, 301)
  }

  const isAuthenticated = cookies.get(AUTH_COOKIE)
  const isProfileComplete = cookies.get(PROFILE_COOKIE)
  const isAdmin = cookies.get(ADMIN_COOKIE)

  // 2. User Authentication logic
  if (!isAuthenticated) {
    if (PROTECTED_USER_ROUTES.some(p => path.startsWith(p))) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callback', path)
      return NextResponse.redirect(url)
    }
  } else {
    // Logged in users shouldn't access login/register
    if (PUBLIC_ONLY_ROUTES.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 3. Mandatory Profile Completion check
    if (isAuthenticated && isProfileComplete) {
      if (INCOMPLETE_PROFILE_REDIRECTS.includes(path)) {
        return NextResponse.redirect(new URL('/dashboard/edit-profile', request.url))
      }
    }
  }

  // 4. Admin Protection (Example logic, can be expanded)
  if (path.startsWith('/admin') && !path.includes('/auth') && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/auth/login', request.url))
  }

  return NextResponse.next()
}

// Optimization: Run middleware only for specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/registrasi',
    '/login',
    '/admin/:path*',
    '/layanan/:path*',
  ],
}
