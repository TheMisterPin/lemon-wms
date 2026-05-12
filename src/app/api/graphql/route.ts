import { createYoga } from 'graphql-yoga'

import type { AccessTokenPayload } from '@/lib/auth/jwt'
import { verifyToken } from '@/lib/auth/jwt'
import { isOfficeRole } from '@/lib/auth/middleware'
import { schema } from '@/lib/graphql'
import prisma from '@/lib/prisma'

function extractBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response, Request, Headers },
  context: async ({ request }) => {
    const token = extractBearerToken(request)
    let user: AccessTokenPayload | null = null

    if (token) {
      try {
        user = verifyToken<AccessTokenPayload>(token)
      } catch {
        // invalid token → user stays null
      }
    }

    if (!user || !isOfficeRole(user.role)) {
      throw new Error('Unauthorized')
    }

    return { user, prisma }
  },
})

export async function GET(request: Request): Promise<Response> {
  return handleRequest(request, {})
}

export async function POST(request: Request): Promise<Response> {
  return handleRequest(request, {})
}
