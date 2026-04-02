import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyToken, type AccessTokenPayload } from '@/lib/auth/jwt'
import {
  isFloorRole,
  isOfficeRole,
  verifyAccessTokenFromRequest
} from '@/lib/auth/middleware'

const PUBLIC_PATHS = ['/login', '/floor']
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/floor/login', '/api/auth/refresh']

const getTokenFromCookie = (request: NextRequest): string | null => {
  return request.cookies.get('access_token')?.value ?? null
}

const hasRefreshTokenCookie = (request: NextRequest): boolean => {
  return Boolean(request.cookies.get('refresh_token')?.value)
}

/**
 * Decode a JWT without verifying expiry — used to extract the payload
 * from an expired-but-present access token so the middleware can let
 * the request through for client-side refresh.
 */
const decodeTokenUnsafe = (token: string): AccessTokenPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    if (payload.userId && payload.role) return payload as AccessTokenPayload
    return null
  } catch {
    return null
  }
}

type AuthResult = {
  payload: AccessTokenPayload | null
  expired: boolean
}

const resolveAuthPayload = (request: NextRequest): AuthResult => {
  const headerPayload = verifyAccessTokenFromRequest(request)
  if (headerPayload) {
    return { payload: headerPayload, expired: false }
  }

  const cookieToken = getTokenFromCookie(request)
  if (!cookieToken) {
    return { payload: null, expired: false }
  }

  try {
    return { payload: verifyToken<AccessTokenPayload>(cookieToken), expired: false }
  } catch {
    // Token exists but is expired — decode it so we can still route correctly
    // and let the client-side refresh handle getting a new token
    const decoded = decodeTokenUnsafe(cookieToken)
    return { payload: decoded, expired: !!decoded }
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

  const { payload, expired } = resolveAuthPayload(request)
  const hasRefreshToken = hasRefreshTokenCookie(request)

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

  // Token expired but present — let page requests through so client-side
  // AuthProvider can refresh the token. Block API requests with 401.
  if (expired) {
    // If we don't have a refresh token, this is effectively logged-out state.
    // Redirect immediately instead of allowing a protected page shell.
    if (!hasRefreshToken) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }

    // Let the page load — AuthProvider will call /api/auth/refresh
    return NextResponse.next()
  }

  // Authenticated: redirect away from auth pages and root
  if (pathname === '/' || pathname === '/login' || pathname === '/floor') {
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
