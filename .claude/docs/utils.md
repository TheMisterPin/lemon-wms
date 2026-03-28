# src/utils/ Documentation

## Overview
The `utils` directory is the **business logic hub** of the application. ALL business logic, data validation, transformations, and database operations live here. This is a critical architectural principle - no business logic should exist in API routes or components.

## Core Principle
> **"If it's not UI rendering or HTTP handling, it belongs in utils"**

## Directory Structure

```
src/utils/
├── auth/                    # Authentication and authorization logic
│   └── auth.ts
├── forms/                   # Form validation schemas
│   └── schemas/
│       ├── create-user-form.ts
│       ├── create-location-form.ts
│       └── login-form.ts
├── location/                # Location management logic
│   └── location.ts
├── user/                    # User management logic
│   ├── index.ts            # Barrel export
│   ├── create-user.ts
│   ├── user-utility.ts
│   └── check-password.ts
└── index.ts                 # Root barrel export
```

## Organizational Pattern

### Domain-Driven Structure
Utils are organized by **domain model** (entity type):
- `/auth` - Authentication and session management
- `/user` - User-related operations
- `/location` - Location-related operations
- `/box` - Box operations (future)
- `/content` - Content operations (future)
- `/forms` - Form validation schemas (cross-cutting)

### File Organization Within Domains
Each domain folder follows this pattern:

1. **Small, focused function files**: One or two related functions per file
2. **Descriptive names**: `create-user.ts`, `update-user.ts`, `delete-user.ts`
3. **Barrel exports**: `index.ts` file to re-export all domain functions

**Example** (`/user` domain):
```
user/
├── index.ts              # export * from './create-user'; export * from './user-utility'
├── create-user.ts        # createUser function
├── user-utility.ts       # checkUser, getAllUsers functions
└── check-password.ts     # checkPassword function
```

## Standard Response Format

### BasicResponse Interface
**EVERY utils function MUST return this format:**

```typescript
export interface BasicResponse {
	success: boolean
	message?: string
	data: any
	error?: any
	code?: number
}
```

### Usage Guidelines

**Success Response**:
```typescript
return {
	success: true,
	message: 'Operation completed successfully',
	data: result,
	code: 200  // or 201 for creation
}
```

**Error Response**:
```typescript
return {
	success: false,
	message: 'User-friendly error message',
	data: null,
	error: error,  // Can include error details for debugging
	code: 400  // or appropriate HTTP status code
}
```

### HTTP Status Codes
Use these standard codes:
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (auth required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Function Patterns

### 1. Create Operations

**Example**: `create-user.ts`
```typescript
import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'
import { checkUser } from './user-utility'

export const createUser = async (
	name: string,
	email: string,
	password: string
): Promise<BasicResponse> => {
	try {
		// 1. Validation - check if user already exists
		const existing = await checkUser(email)
		if (existing) {
			return {
				success: false,
				message: 'User already exists',
				data: null,
				code: 409
			}
		}

		// 2. Database operation
		const user = await prisma.user.create({
			data: { name, email, password }
		})

		// 3. Success response
		return {
			success: true,
			message: 'User created successfully',
			data: user,
			code: 201
		}
	} catch (error) {
		// 4. Error handling
		return {
			success: false,
			message: 'Error creating user',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

**Pattern Summary**:
1. Validate input and check business rules
2. Perform database operation
3. Return success response with data
4. Catch and return formatted errors

### 2. Read Operations

**Example**: Get all records
```typescript
export const getAllUsers = async (): Promise<BasicResponse> => {
	try {
		const users = await prisma.user.findMany({
			// Future: add where: { deletedAt: null } for soft deletes
			orderBy: { createdAt: 'desc' }
		})

		return {
			success: true,
			message: 'Users retrieved successfully',
			data: users,
			code: 200
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error fetching users',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

**Example**: Get single record
```typescript
export const getUserById = async (id: string): Promise<BasicResponse> => {
	try {
		const user = await prisma.user.findUnique({
			where: { id }
		})

		if (!user) {
			return {
				success: false,
				message: 'User not found',
				data: null,
				code: 404
			}
		}

		return {
			success: true,
			data: user,
			code: 200
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error fetching user',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

### 3. Update Operations

```typescript
export const updateUser = async (
	id: string,
	data: { name?: string; email?: string }
): Promise<BasicResponse> => {
	try {
		// 1. Check if user exists
		const existing = await prisma.user.findUnique({ where: { id } })
		if (!existing) {
			return {
				success: false,
				message: 'User not found',
				data: null,
				code: 404
			}
		}

		// 2. If email is being updated, check for duplicates
		if (data.email && data.email !== existing.email) {
			const duplicate = await checkUser(data.email)
			if (duplicate) {
				return {
					success: false,
					message: 'Email already in use',
					data: null,
					code: 409
				}
			}
		}

		// 3. Update
		const user = await prisma.user.update({
			where: { id },
			data
		})

		return {
			success: true,
			message: 'User updated successfully',
			data: user,
			code: 200
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error updating user',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

### 4. Delete Operations

**Hard Delete** (current implementation):
```typescript
export const deleteUser = async (id: string): Promise<BasicResponse> => {
	try {
		const user = await prisma.user.delete({
			where: { id }
		})

		return {
			success: true,
			message: 'User deleted successfully',
			data: user,
			code: 200
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error deleting user',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

**Soft Delete** (future implementation):
```typescript
export const deleteUser = async (id: string): Promise<BasicResponse> => {
	try {
		const user = await prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() }
		})

		return {
			success: true,
			message: 'User deleted successfully',
			data: user,
			code: 200
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error deleting user',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

### 5. Utility Functions

**Example**: Check if user exists
```typescript
export const checkUser = async (email: string): Promise<boolean> => {
	const user = await prisma.user.findUnique({
		where: { email }
	})
	return !!user
}
```

**Note**: Simple utility functions that return boolean or primitive values don't need to return BasicResponse. Only functions that will be called directly by API routes should return BasicResponse.

## Domain-Specific Guidelines

### Authentication (`/auth`)

**Current State**: Minimal implementation
**TODO**:
- Implement JWT generation
- Implement token validation
- Implement password hashing (bcrypt/argon2)
- Implement token refresh logic

**Future Pattern**:
```typescript
export const authenticateUser = async (
	email: string,
	password: string
): Promise<BasicResponse> => {
	try {
		// 1. Find user
		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) {
			return {
				success: false,
				message: 'Invalid credentials',
				data: null,
				code: 401
			}
		}

		// 2. Verify password
		const isValid = await checkPassword(password, user.password)
		if (!isValid) {
			return {
				success: false,
				message: 'Invalid credentials',
				data: null,
				code: 401
			}
		}

		// 3. Generate JWT
		const token = generateToken({ userId: user.id, email: user.email })

		return {
			success: true,
			message: 'Login successful',
			data: { user, token },
			code: 200
		}
	} catch (error) {
		return {
			success: false,
			message: 'Authentication error',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

### Form Schemas (`/forms/schemas`)

**Purpose**: Centralized Zod schemas for form validation

**Current Schemas**:
- `create-user-form.ts`
- `create-location-form.ts`
- `login-form.ts`

**Schema Pattern**:
```typescript
import * as z from 'zod'

export const myFormSchema = z.object({
	fieldName: z
		.string()
		.min(5, 'Field must be at least 5 characters.')
		.max(100, 'Field must be at most 100 characters.'),
	email: z
		.string()
		.email('Please enter a valid email address.')
		.max(100, 'Email must be at most 100 characters.'),
	age: z
		.number()
		.min(18, 'Must be at least 18 years old.')
		.max(120, 'Invalid age.'),
	isActive: z.boolean().default(true)
})
```

**Schema Guidelines**:
1. Export as named constant (not default)
2. Use descriptive error messages
3. Include both min and max validations
4. Use built-in validators (`.email()`, `.url()`, etc.)
5. Set sensible defaults with `.default()`
6. Match database constraints

**Reusing Schemas in API Routes**:
```typescript
import { myFormSchema } from '@/utils/forms/schemas/my-form'

// In API route
const validated = myFormSchema.safeParse(requestBody)
if (!validated.success) {
	return NextResponse.json(
		{ error: validated.error.errors[0].message },
		{ status: 400 }
	)
}
```

### User Operations (`/user`)

**Current Functions**:
- `createUser(name, email, password)` - Create new user
- `getAllUsers()` - Get all users
- `checkUser(email)` - Check if user exists
- `checkPassword()` - Password verification (TODO: implement hashing)

**TODO**:
- `updateUser(id, data)`
- `deleteUser(id)`
- `getUserById(id)`
- Password hashing in `createUser`

### Location Operations (`/location`)

**Current Functions**:
- Basic location management (implementation in progress)

**TODO**:
- `createLocation(userId, name, icon)`
- `getAllLocations(userId)`
- `getLocationById(id)`
- `updateLocation(id, data)`
- `deleteLocation(id)`

## Database Operations

### Prisma Client Usage
```typescript
import prisma from '@/lib/prisma'

// The prisma client is configured in /lib/prisma.ts
// Always import from there to ensure singleton pattern
```

### Transaction Pattern
For operations affecting multiple tables:

```typescript
export const createBoxWithContents = async (
	boxData: BoxData,
	contents: ContentData[]
): Promise<BasicResponse> => {
	try {
		const result = await prisma.$transaction(async (tx) => {
			// Create box
			const box = await tx.box.create({
				data: boxData
			})

			// Create contents
			const createdContents = await tx.content.createMany({
				data: contents.map(c => ({ ...c, boxId: box.id }))
			})

			return { box, contents: createdContents }
		})

		return {
			success: true,
			message: 'Box and contents created',
			data: result,
			code: 201
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error creating box and contents',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

### Query Patterns

**Include related data**:
```typescript
const location = await prisma.location.findUnique({
	where: { id },
	include: {
		user: true,
		boxes: {
			include: {
				contents: true
			}
		}
	}
})
```

**Filtering**:
```typescript
const userLocations = await prisma.location.findMany({
	where: {
		userId: userId,
		// Future: deletedAt: null  (for soft deletes)
	},
	orderBy: {
		createdAt: 'desc'
	}
})
```

## Error Handling Best Practices

### 1. Always Use Try-Catch
```typescript
export const myFunction = async (): Promise<BasicResponse> => {
	try {
		// ... operation
	} catch (error) {
		return {
			success: false,
			message: 'User-friendly message',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

### 2. Validate Before Operations
```typescript
// Check if resource exists before updating/deleting
const existing = await prisma.resource.findUnique({ where: { id } })
if (!existing) {
	return {
		success: false,
		message: 'Resource not found',
		data: null,
		code: 404
	}
}
```

### 3. Check Business Rules
```typescript
// Example: prevent duplicate entries
const duplicate = await checkUser(email)
if (duplicate) {
	return {
		success: false,
		message: 'User already exists',
		data: null,
		code: 409
	}
}
```

## Testing Considerations

**Current State**: No tests implemented (post-MVP)

**Future Testing Pattern**:
```typescript
// tests/utils/user/create-user.test.ts
import { createUser } from '@/utils/user/create-user'

describe('createUser', () => {
	it('should create a user successfully', async () => {
		const result = await createUser('John', 'john@example.com', 'password123')

		expect(result.success).toBe(true)
		expect(result.code).toBe(201)
		expect(result.data).toHaveProperty('id')
	})

	it('should return error for duplicate email', async () => {
		await createUser('John', 'john@example.com', 'password123')
		const result = await createUser('Jane', 'john@example.com', 'password456')

		expect(result.success).toBe(false)
		expect(result.code).toBe(409)
	})
})
```

## Development Checklist

When creating a new utils function:

- [ ] Function returns `BasicResponse` format
- [ ] Uses try-catch error handling
- [ ] Validates input and business rules
- [ ] Uses Prisma for database operations
- [ ] Returns appropriate HTTP status codes
- [ ] Includes user-friendly error messages
- [ ] Follows naming convention (camelCase)
- [ ] Placed in appropriate domain folder
- [ ] Exported from domain's `index.ts`
- [ ] Handles edge cases (not found, duplicate, etc.)
- [ ] Uses TypeScript types for parameters
- [ ] Documented with JSDoc comments (optional but recommended)

## Best Practices Summary

### DO
✅ Put ALL business logic in utils
✅ Return BasicResponse from all API-facing functions
✅ Use try-catch for error handling
✅ Validate data before database operations
✅ Check business rules (duplicates, permissions, etc.)
✅ Use appropriate HTTP status codes
✅ Keep functions small and focused
✅ Use descriptive function names
✅ Import Prisma from `/lib/prisma`
✅ Use transactions for multi-table operations

### DON'T
❌ Put business logic in API routes or components
❌ Return raw data without BasicResponse wrapper
❌ Skip error handling
❌ Skip validation
❌ Use generic error messages
❌ Create large, multi-purpose functions
❌ Import Prisma client directly
❌ Skip null/undefined checks
❌ Use any type - use proper TypeScript types

## Future Enhancements

### Planned Domains
- `/box` - Box CRUD operations, set/group management
- `/content` - Content item management
- `/qr` - QR code generation
- `/label` - Label generation (PNG)
- `/season` - Season management (fixed set)

### Planned Features
- Password hashing (bcrypt/argon2)
- JWT token generation and validation
- Soft delete implementation
- Image upload handling
- File storage integration
- Email notifications
- Audit logging
