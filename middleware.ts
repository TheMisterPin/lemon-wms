import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyToken, type AccessTokenPayload } from '@/lib/auth/jwt'
import {
  isFloorRole,
  isOfficeRole,
  verifyAccessTokenFromRequest
} from '@/lib/auth/middleware'

const PUBLIC_PATHS = ['/', '/login', '/floor']
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/floor/login', '/api/auth/refresh']

const getTokenFromCookie = (request: NextRequest): string | null => {
  return request.cookies.get('access_token')?.value ?? null
}

const resolveAuthPayload = (request: NextRequest): AccessTokenPayload | null => {
  const headerPayload = verifyAccessTokenFromRequest(request)
  if (headerPayload) {
    return headerPayload
  }

  const cookieToken = getTokenFromCookie(request)
  if (!cookieToken) {
    return null
  }

  try {
    return verifyToken<AccessTokenPayload>(cookieToken)
  } catch {
    return null
  }
}

const isPublicPath = (pathname: string): boolean => PUBLIC_PATHS.includes(pathname)
const isPublicApiPath = (pathname: string): boolean =>
  PUBLIC_API_PATHS.some((apiPath) => pathname.startsWith(apiPath))

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  if (isPublicApiPath(pathname)) {
    return NextResponse.next()
  }

  const payload = resolveAuthPayload(request)

  // Unauthenticated: redirect to /login for pages, 401 for API
  if (!payload) {
    if (isPublicPath(pathname)) {
      return NextResponse.next()
    }
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated: redirect away from auth pages
  if (pathname === '/login' || pathname === '/floor') {
    const target = isOfficeRole(payload.role) ? '/dashboard' : '/warehouse'

    return NextResponse.redirect(new URL(target, request.url))
  }

  // Role-based access control
  if (pathname.startsWith('/dashboard') && !isOfficeRole(payload.role)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.redirect(new URL('/warehouse', request.url))
  }

  if (pathname.startsWith('/warehouse') && !isFloorRole(payload.role)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const headers = new Headers(request.headers)
  headers.set('x-user-id', payload.userId)
  headers.set('x-user-role', payload.role)

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: '/:path*'
}
