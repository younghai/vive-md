import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/', '/contacts', '/deals', '/tasks', '/activities', '/reports', '/settings']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Zustand persist uses localStorage, so we can't reliably check auth state in Edge Middleware
  // However, we can check for the refresh_token cookie set by the backend
  const hasRefreshToken = request.cookies.has('refresh_token')

  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
  const isAuthRoute = authRoutes.includes(pathname)

  if (isProtectedRoute && !hasRefreshToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && hasRefreshToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
