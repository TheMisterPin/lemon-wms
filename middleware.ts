import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyToken, type AccessTokenPayload } from '@/lib/auth/jwt'
import {
  isFloorRole,
  isOfficeRole,
  verifyAccessTokenFromRequest
} from '@/lib/auth/middleware'

const PUBLIC_PATHS = ['/login', '/floor']

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
    if (parts.length !== 3) {
      return null
    }
    const payload = JSON.parse(atob(parts[1]))
    if (payload.userId && payload.role) {
      return payload as AccessTokenPayload
    }

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  // API routes authenticate inside their own Node handlers. Skipping auth here
  // avoids duplicate verification in Edge middleware on Vercel previews.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  const hasRefreshToken = hasRefreshTokenCookie(request)
  const { payload, expired } = resolveAuthPayload(request)

  // Unauthenticated: redirect to /login for pages
  if (!payload) {
    if (isPublicPath(pathname)) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Token expired but present — let page requests through so client-side
  // AuthProvider can refresh the token.
  if (expired) {
    // If we don't have a refresh token, this is effectively logged-out state.
    // Redirect immediately instead of allowing a protected page shell.
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL('/login', request.url))
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
    return NextResponse.redirect(new URL('/warehouse', request.url))
  }

  if (pathname.startsWith('/warehouse') && !isFloorRole(payload.role)) {
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
