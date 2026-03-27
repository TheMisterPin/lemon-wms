import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyToken } from './src/utils/auth/verify-token'

// Define protected and public routes
const protectedRoutes = [
  '/users',
  // Add other protected routes here
]

const protectedApiRoutes = [
  '/api/user',
  '/api/location',
  // Add other protected API routes here
]

const publicApiRoutes = [
  '/api/auth/login',
  // Add other public API routes here
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route))
  const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route))

  // Allow public API routes without authentication
  if (isPublicApi) {
    return NextResponse.next()
  }

  // Check for protected routes or APIs
  if (isProtectedRoute || isProtectedApi) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      // No token provided
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
      }
      // Redirect to login for web routes
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Verify token
    const validation = await verifyToken(token)

    if (!validation.valid) {
      // Invalid token
      if (isProtectedApi) {
        return NextResponse.json({ error: `Unauthorized - ${validation.error}` }, { status: 401 })
      }
      // Redirect to login for web routes
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Token is valid - attach user info to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', validation.userId!)
    requestHeaders.set('x-user-email', validation.email!)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Allow all other routes
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
