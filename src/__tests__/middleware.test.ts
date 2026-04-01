import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { signAccessToken } from '@/lib/auth/jwt'

import { middleware } from '../../middleware'

const SECRET = 'test-secret-for-unit-tests-at-least-32-chars'
const BASE = 'http://localhost:3000'

function makeRequest(
  pathname: string,
  opts?: { cookie?: { name: string; value: string }; bearer?: string }
): NextRequest {
  const url = `${BASE}${pathname}`
  const req = new NextRequest(url)

  if (opts?.cookie) {
    req.cookies.set(opts.cookie.name, opts.cookie.value)
  }
  if (opts?.bearer) {
    req.headers.set('authorization', `Bearer ${opts.bearer}`)
  }

  return req
}

function validToken(role: string = 'OWNER') {
  return signAccessToken({ userId: 'u1', role: role as 'OWNER' })
}

function expiredToken(role: string = 'OWNER') {
  return jwt.sign({ userId: 'u1', role }, SECRET, { expiresIn: -1 })
}

// ---------------------------------------------------------------------------
// Static / asset paths — always pass through
// ---------------------------------------------------------------------------

describe('middleware — static assets', () => {
  it('passes through /_next requests', () => {
    const res = middleware(makeRequest('/_next/static/chunk.js'))
    expect(res.status).toBe(200)
  })

  it('passes through image files', () => {
    const res = middleware(makeRequest('/logo.png'))
    expect(res.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// Public API paths — always pass through
// ---------------------------------------------------------------------------

describe('middleware — public API paths', () => {
  it.each(['/api/auth/login', '/api/auth/floor/login', '/api/auth/refresh'])(
    'passes through %s without auth',
    (path) => {
      const res = middleware(makeRequest(path))
      expect(res.status).toBe(200)
    }
  )
})

// ---------------------------------------------------------------------------
// No token at all — redirect pages, 401 APIs
// ---------------------------------------------------------------------------

describe('middleware — no token', () => {
  it('redirects /dashboard to /login', () => {
    const res = middleware(makeRequest('/dashboard'))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/login')
  })

  it('returns 401 for protected API routes', () => {
    const res = middleware(makeRequest('/api/warehouses'))
    expect(res.status).toBe(401)
  })

  it('allows /login without a token', () => {
    const res = middleware(makeRequest('/login'))
    expect(res.status).toBe(200)
  })

  it('allows /floor without a token', () => {
    const res = middleware(makeRequest('/floor'))
    expect(res.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// Expired token — THE BUG FIX: page requests pass through, API gets 401
// ---------------------------------------------------------------------------

describe('middleware — expired access token in cookie', () => {
  it('lets page requests through so client-side refresh can run', () => {
    const token = expiredToken('OWNER')
    const res = middleware(makeRequest('/dashboard', { cookie: { name: 'access_token', value: token } }))

    // Must NOT redirect to /login — that was the prod bug
    expect(res.status).toBe(200)
  })

  it('lets page requests through for floor roles too', () => {
    const token = expiredToken('WAREHOUSE_MANAGER')
    const res = middleware(makeRequest('/warehouse', { cookie: { name: 'access_token', value: token } }))

    expect(res.status).toBe(200)
  })

  it('returns 401 for API requests with expired token', () => {
    const token = expiredToken('OWNER')
    const res = middleware(makeRequest('/api/warehouses', { cookie: { name: 'access_token', value: token } }))

    expect(res.status).toBe(401)
  })

  it('returns "Token expired" error message for expired API requests', async () => {
    const token = expiredToken('OWNER')
    const res = middleware(makeRequest('/api/warehouses', { cookie: { name: 'access_token', value: token } }))

    const body = await res.json()
    expect(body.error).toBe('Token expired')
  })

  it('treats a completely garbage cookie as unauthenticated (not expired)', () => {
    const res = middleware(
      makeRequest('/dashboard', { cookie: { name: 'access_token', value: 'not-a-jwt-at-all' } })
    )

    // Garbage token can't be decoded — treated as no auth → redirect to /login
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/login')
  })
})

// ---------------------------------------------------------------------------
// Valid token — normal authenticated routing
// ---------------------------------------------------------------------------

describe('middleware — valid token', () => {
  it('redirects OWNER from / to /dashboard', () => {
    const res = middleware(makeRequest('/', { cookie: { name: 'access_token', value: validToken('OWNER') } }))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/dashboard')
  })

  it('redirects WAREHOUSE_MANAGER from / to /warehouse', () => {
    const res = middleware(
      makeRequest('/', { cookie: { name: 'access_token', value: validToken('WAREHOUSE_MANAGER') } })
    )
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/warehouse')
  })

  it('redirects OWNER from /login to /dashboard', () => {
    const res = middleware(
      makeRequest('/login', { cookie: { name: 'access_token', value: validToken('OWNER') } })
    )
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/dashboard')
  })

  it('allows OWNER to access /dashboard', () => {
    const res = middleware(
      makeRequest('/dashboard', { cookie: { name: 'access_token', value: validToken('OWNER') } })
    )
    expect(res.status).toBe(200)
  })

  it('allows WAREHOUSE_WORKER to access /warehouse', () => {
    const res = middleware(
      makeRequest('/warehouse', { cookie: { name: 'access_token', value: validToken('WAREHOUSE_WORKER') } })
    )
    expect(res.status).toBe(200)
  })

  it('redirects floor role away from /dashboard to /warehouse', () => {
    const res = middleware(
      makeRequest('/dashboard', {
        cookie: { name: 'access_token', value: validToken('WAREHOUSE_MANAGER') }
      })
    )
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/warehouse')
  })

  it('redirects office role away from /warehouse to /dashboard', () => {
    const res = middleware(
      makeRequest('/warehouse', {
        cookie: { name: 'access_token', value: validToken('OFFICE_WORKER') }
      })
    )
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/dashboard')
  })

  it('sets x-user-id and x-user-role headers on authenticated requests', () => {
    const res = middleware(
      makeRequest('/dashboard/warehouses', {
        cookie: { name: 'access_token', value: validToken('OWNER') }
      })
    )
    expect(res.status).toBe(200)
    // Next.js middleware sets headers via request rewrite
    expect(res.headers.get('x-middleware-request-x-user-id')).toBe('u1')
    expect(res.headers.get('x-middleware-request-x-user-role')).toBe('OWNER')
  })

  it('accepts token from Authorization header instead of cookie', () => {
    const res = middleware(
      makeRequest('/dashboard', { bearer: validToken('OWNER') })
    )
    expect(res.status).toBe(200)
  })
})
