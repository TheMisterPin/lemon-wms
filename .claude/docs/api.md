# src/app/api/ Documentation

## Overview
API routes in Next.js App Router provide backend endpoints for the application. These routes handle HTTP requests, validate input, call business logic from `/utils`, and return formatted responses.

## Critical Architecture Principle
> **API routes are THIN layers** - they handle ONLY HTTP request/response logic. ALL business logic belongs in `/utils`.

## Directory Structure

```
src/app/api/
├── auth/
│   └── login/
│       └── route.ts          # POST /api/auth/login
├── location/
│   └── route.ts              # GET, POST /api/location
└── user/
    └── route.ts              # GET, POST /api/user
```

## File Naming Convention

**Must be named `route.ts`** (or `route.js`)

Each `route.ts` file exports HTTP method handlers:
- `GET` - Retrieve data
- `POST` - Create data
- `PUT` - Update data (full replacement)
- `PATCH` - Update data (partial)
- `DELETE` - Delete data

## URL Mapping

Folder structure determines the URL:
```
api/user/route.ts           → /api/user
api/auth/login/route.ts     → /api/auth/login
api/boxes/[id]/route.ts     → /api/boxes/123
```

## Standard Route Pattern

### Basic Structure

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { myUtilFunction } from '@/utils/domain/my-util'

export const runtime = 'nodejs'  // or 'edge'

export async function GET(req: NextRequest) {
	try {
		// 1. Extract query parameters (if any)
		const { searchParams } = new URL(req.url)
		const param = searchParams.get('param')

		// 2. Call utils function (where business logic lives)
		const result = await myUtilFunction(param)

		// 3. Check result and return appropriate response
		if (result.success) {
			return NextResponse.json(result.data, { status: result.code || 200 })
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 400 }
			)
		}
	} catch (error) {
		// 4. Handle unexpected errors
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
```

### Key Components

**1. Request (`NextRequest`)**:
- Access to request data (body, headers, cookies, URL)
- Built on Web APIs (Request/Response)

**2. Response (`NextResponse`)**:
- Utility to create JSON responses
- Set status codes and headers

**3. Runtime**:
- `nodejs` - Full Node.js runtime (default)
- `edge` - Edge runtime (faster, but limited APIs)

## HTTP Method Handlers

### GET - Retrieve Data

**Use cases**: Fetch single resource, list resources, search/filter

**Pattern**:
```typescript
export async function GET(req: NextRequest) {
	try {
		// Option 1: Get all
		const result = await getAllItems()

		// Option 2: Get by query parameter
		const { searchParams } = new URL(req.url)
		const id = searchParams.get('id')
		const result = await getItemById(id)

		if (result.success) {
			return NextResponse.json(result.data, { status: 200 })
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 404 }
			)
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch items' },
			{ status: 500 }
		)
	}
}
```

**Example** - Get all users:
```typescript
// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '@/utils/user'

export const runtime = 'nodejs'

export async function GET() {
	const result = await getAllUsers()

	try {
		if (result.success) {
			return NextResponse.json(result.data, { status: 200 })
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 400 }
			)
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch users' },
			{ status: 500 }
		)
	}
}
```

### POST - Create Data

**Use cases**: Create new resources

**Pattern**:
```typescript
export async function POST(req: NextRequest) {
	try {
		// 1. Parse request body
		const body = await req.json()
		const { field1, field2, field3 } = body

		// 2. Optional: Validate with Zod schema
		const validated = mySchema.safeParse(body)
		if (!validated.success) {
			return NextResponse.json(
				{ error: validated.error.errors[0].message },
				{ status: 400 }
			)
		}

		// 3. Call utils function
		const result = await createItem(field1, field2, field3)

		// 4. Return response
		if (result.success) {
			return NextResponse.json(result.data, { status: 201 })
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 400 }
			)
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to create item' },
			{ status: 500 }
		)
	}
}
```

**Example** - Create user:
```typescript
// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/utils/user'

export async function POST(req: NextRequest) {
	try {
		const { name, email, password } = await req.json()

		const result = await createUser(name, email, password)

		if (result.success) {
			return NextResponse.json(result.data, { status: 201 })
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 400 }
			)
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to create user' },
			{ status: 500 }
		)
	}
}
```

### PUT/PATCH - Update Data

**PUT**: Full replacement
**PATCH**: Partial update (preferred)

**Pattern**:
```typescript
export async function PATCH(req: NextRequest) {
	try {
		const body = await req.json()
		const { id, ...updateData } = body

		const result = await updateItem(id, updateData)

		if (result.success) {
			return NextResponse.json(result.data, { status: 200 })
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 404 }
			)
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to update item' },
			{ status: 500 }
		)
	}
}
```

### DELETE - Remove Data

**Pattern**:
```typescript
export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const id = searchParams.get('id')

		if (!id) {
			return NextResponse.json(
				{ error: 'ID is required' },
				{ status: 400 }
			)
		}

		const result = await deleteItem(id)

		if (result.success) {
			return NextResponse.json(
				{ message: 'Item deleted successfully' },
				{ status: 200 }
			)
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 404 }
			)
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to delete item' },
			{ status: 500 }
		)
	}
}
```

## Dynamic Routes

### Single Dynamic Segment

```typescript
// app/api/boxes/[id]/route.ts
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const boxId = params.id

	const result = await getBoxById(boxId)

	if (result.success) {
		return NextResponse.json(result.data, { status: 200 })
	} else {
		return NextResponse.json(
			{ error: result.message },
			{ status: 404 }
		)
	}
}
```

**URL**: `/api/boxes/123` → `params.id = "123"`

### Multiple Dynamic Segments

```typescript
// app/api/locations/[locationId]/boxes/[boxId]/route.ts
export async function GET(
	req: NextRequest,
	{ params }: { params: { locationId: string; boxId: string } }
) {
	const { locationId, boxId } = params

	const result = await getBoxInLocation(locationId, boxId)

	if (result.success) {
		return NextResponse.json(result.data, { status: 200 })
	} else {
		return NextResponse.json(
			{ error: result.message },
			{ status: 404 }
		)
	}
}
```

**URL**: `/api/locations/loc1/boxes/box1`

## Request Data Access

### Query Parameters (GET requests)

```typescript
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)

	const search = searchParams.get('search')        // ?search=value
	const page = searchParams.get('page')            // ?page=1
	const limit = searchParams.get('limit')          // ?limit=10

	// Use in utils call
	const result = await searchItems({ search, page, limit })

	// ...
}
```

### Request Body (POST, PUT, PATCH)

```typescript
export async function POST(req: NextRequest) {
	// Parse JSON body
	const body = await req.json()
	const { field1, field2 } = body

	// Or for FormData
	const formData = await req.formData()
	const file = formData.get('file')

	// ...
}
```

### Headers

```typescript
export async function GET(req: NextRequest) {
	const authHeader = req.headers.get('authorization')
	const token = authHeader?.replace('Bearer ', '')

	// ...
}
```

### Cookies

```typescript
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
	const cookieStore = cookies()
	const token = cookieStore.get('token')

	// ...
}
```

## Response Patterns

### JSON Response

```typescript
return NextResponse.json(data, { status: 200 })
```

### Error Response

```typescript
return NextResponse.json(
	{ error: 'Error message', details: 'Additional info' },
	{ status: 400 }
)
```

### Response with Headers

```typescript
return NextResponse.json(data, {
	status: 200,
	headers: {
		'X-Custom-Header': 'value',
		'Cache-Control': 'no-cache'
	}
})
```

### Set Cookie

```typescript
const response = NextResponse.json(data)
response.cookies.set('token', token, {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	maxAge: 60 * 60 * 24 * 7 // 1 week
})
return response
```

## Authentication Pattern

### Token-Based Auth (JWT)

**Login endpoint**:
```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/utils/auth/auth'

export async function POST(req: NextRequest) {
	try {
		const { email, password } = await req.json()

		const result = await authenticateUser(email, password)

		if (result.success) {
			const response = NextResponse.json(result.data, { status: 200 })

			// Set token cookie
			response.cookies.set('token', result.data.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7  // 1 week
			})

			return response
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: 401 }
			)
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Authentication failed' },
			{ status: 500 }
		)
	}
}
```

**Protected endpoint**:
```typescript
export async function GET(req: NextRequest) {
	// 1. Check auth
	const token = req.cookies.get('token')?.value
	if (!token) {
		return NextResponse.json(
			{ error: 'Unauthorized' },
			{ status: 401 }
		)
	}

	// 2. Validate token (in utils)
	const validation = await validateToken(token)
	if (!validation.success) {
		return NextResponse.json(
			{ error: 'Invalid token' },
			{ status: 401 }
		)
	}

	// 3. Continue with request
	const result = await getProtectedData(validation.data.userId)

	if (result.success) {
		return NextResponse.json(result.data, { status: 200 })
	} else {
		return NextResponse.json(
			{ error: result.message },
			{ status: 400 }
		)
	}
}
```

## Validation Pattern

### Using Zod Schemas

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createBoxSchema } from '@/utils/forms/schemas/create-box-form'
import { createBox } from '@/utils/box'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()

		// Validate with Zod
		const validated = createBoxSchema.safeParse(body)

		if (!validated.success) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					details: validated.error.errors
				},
				{ status: 400 }
			)
		}

		// Use validated data
		const result = await createBox(validated.data)

		if (result.success) {
			return NextResponse.json(result.data, { status: 201 })
		} else {
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 400 }
			)
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to create box' },
			{ status: 500 }
		)
	}
}
```

## Error Handling

### Standard Error Response Pattern

```typescript
export async function POST(req: NextRequest) {
	try {
		// ... operation
		const result = await someOperation()

		if (result.success) {
			return NextResponse.json(result.data, { status: result.code || 200 })
		} else {
			// Business logic error (from utils)
			return NextResponse.json(
				{ error: result.message },
				{ status: result.code || 400 }
			)
		}
	} catch (error) {
		// Unexpected error
		console.error('API Error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
```

### Specific Error Types

```typescript
// 400 - Bad Request (validation errors)
return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

// 401 - Unauthorized (authentication required)
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 403 - Forbidden (authenticated but not allowed)
return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

// 404 - Not Found
return NextResponse.json({ error: 'Resource not found' }, { status: 404 })

// 409 - Conflict (duplicate resource)
return NextResponse.json({ error: 'Resource already exists' }, { status: 409 })

// 500 - Internal Server Error
return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
```

## Current API Endpoints

### User Routes (`/api/user`)

**GET /api/user** - Get all users
```typescript
const response = await fetch('/api/user')
const users = await response.json()
```

**POST /api/user** - Create user
```typescript
const response = await fetch('/api/user', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ name, email, password })
})
const user = await response.json()
```

### Auth Routes (`/api/auth/login`)

**POST /api/auth/login** - User login
```typescript
const response = await fetch('/api/auth/login', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ email, password })
})
const { user, token } = await response.json()
```

### Location Routes (`/api/location`)

**Implementation in progress**

## Future API Structure

**Recommended endpoint organization**:

```
/api/
├── auth/
│   ├── login/route.ts           # POST - Login
│   ├── logout/route.ts          # POST - Logout
│   ├── refresh/route.ts         # POST - Refresh token
│   └── register/route.ts        # POST - Register
├── user/
│   ├── route.ts                 # GET (all), POST (create)
│   └── [id]/route.ts           # GET, PATCH, DELETE
├── location/
│   ├── route.ts                 # GET (all), POST (create)
│   └── [id]/
│       ├── route.ts            # GET, PATCH, DELETE
│       └── boxes/route.ts      # GET boxes in location
├── box/
│   ├── route.ts                 # GET (all), POST (create)
│   ├── [id]/
│   │   ├── route.ts            # GET, PATCH, DELETE
│   │   └── contents/route.ts   # GET contents in box
│   └── search/route.ts         # POST - Search boxes
└── qr/
    └── generate/route.ts       # POST - Generate QR code
```

## Best Practices

### DO
✅ Keep routes thin - call utils for business logic
✅ Return BasicResponse-compatible format
✅ Use appropriate HTTP status codes
✅ Validate input with Zod schemas
✅ Handle errors gracefully
✅ Use try-catch blocks
✅ Set proper runtime (`nodejs` or `edge`)
✅ Use TypeScript types for request/response
✅ Implement authentication for protected routes
✅ Return user-friendly error messages

### DON'T
❌ Put business logic in API routes
❌ Return raw Prisma errors to clients
❌ Skip input validation
❌ Use generic status codes (always be specific)
❌ Forget error handling
❌ Return sensitive data (passwords, tokens)
❌ Skip authentication checks on protected routes
❌ Make direct database calls (use utils)
❌ Forget to set Content-Type header
❌ Return inconsistent response formats

## Testing API Routes

**Future pattern** (post-MVP):

```typescript
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/user', () => {
	it('should create a user', async () => {
		const req = new NextRequest('http://localhost:3000/api/user', {
			method: 'POST',
			body: JSON.stringify({
				name: 'John Doe',
				email: 'john@example.com',
				password: 'password123'
			})
		})

		const response = await POST(req)
		const data = await response.json()

		expect(response.status).toBe(201)
		expect(data).toHaveProperty('id')
		expect(data.email).toBe('john@example.com')
	})

	it('should return 409 for duplicate email', async () => {
		// Create first user
		await POST(createRequest({ email: 'john@example.com' }))

		// Try to create duplicate
		const req = createRequest({ email: 'john@example.com' })
		const response = await POST(req)

		expect(response.status).toBe(409)
	})
})
```

## Summary

API routes are the HTTP interface to your application's business logic:

- **Thin layer**: Only handle HTTP - business logic in utils
- **Consistent responses**: Use BasicResponse format
- **Proper status codes**: Be specific (400, 401, 404, etc.)
- **Validation**: Use Zod schemas
- **Error handling**: Try-catch and user-friendly messages
- **Authentication**: Protect sensitive endpoints
- **TypeScript**: Type all requests and responses

Always delegate to `/utils` for any logic beyond parsing requests and formatting responses.
