import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Centralized route protection configuration
const AUTH_COOKIE = 'XSRF081'       // Basic auth
const FIRST_TIMER_COOKIE = 'XSRF087' // Flag for incomplete profile
const ADMIN_COOKIE = 'XSRF091'      // Admin access

const PROTECTED_USER_ROUTES = ['/dashboard']
const PUBLIC_ONLY_ROUTES = ['/registrasi', '/login']
const INCOMPLETE_PROFILE_REDIRECTS = [
  '/layanan/pelatihan/program/akp',
  '/layanan/pelatihan/program/perikanan',
  '/layanan/pelatihan/program/kelautan',
  '/layanan/cek-sertifikat'
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const { cookies } = request

  // 1. Force HTTPS in production (Only if not localhost and header matches exactly 'http')
  const isProd = process.env.NEXT_PUBLIC_NODE_ENV === 'production'
  const isHttp = request.headers.get("x-forwarded-proto") === "http"
  const isLocal = request.nextUrl.hostname === 'localhost'

  if (isProd && isHttp && !isLocal) {
    return NextResponse.redirect(`https://${request.headers.get("host")}${path}`, 307)
  }

  const isAuthenticated = cookies.get(AUTH_COOKIE)
  const isFirstTimer = cookies.get(FIRST_TIMER_COOKIE)
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

    // 3. Mandatory Profile Completion check (If cookie exists, they ARE a first timer/incomplete)
    if (isFirstTimer && path !== '/dashboard/edit-profile') {
      if (INCOMPLETE_PROFILE_REDIRECTS.some(p => path.startsWith(p))) {
        return NextResponse.redirect(new URL('/dashboard/edit-profile', request.url))
      }
    }
  }

  // 4. Admin Protection
  if (path.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/auth/login', request.url))
  }

  return NextResponse.next()
}

// Optimization: Added '/' to matcher if you want to protect the root
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/p2mkp/dashboard/:path*'
  ],
}