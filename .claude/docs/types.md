# src/types/ Documentation

## Overview
The `types` directory contains all TypeScript type definitions, interfaces, and type utilities used across the application. Types are organized by domain and purpose to mirror the structure of `/utils` and facilitate type-safe development.

## Directory Structure

```
src/types/
├── index.ts                           # Barrel exports
├── models/                            # Database model types
│   ├── index.ts
│   ├── user/
│   │   └── user-model.ts
│   ├── location/
│   │   └── location-model.ts
│   └── box/
│       └── box-model.ts
├── requests/                          # API request payload types
│   └── (future request types)
└── responses/                         # API response types
    ├── index.ts
    └── basic-response.ts
```

## Type Categories

### 1. Models (`/models`)

**Purpose**: TypeScript representations of database models (Prisma schema types)

**Pattern**: Mirror your Prisma schema structure

#### Current Models

**User Model** (`/models/user/user-model.ts`):
```typescript
export interface User {
	id: string
	email: string
	password: string  // Note: Never send password to frontend
	name: string | null
	createdAt: Date
	updatedAt: Date
}

// Frontend-safe version (no password)
export interface UserPublic {
	id: string
	email: string
	name: string | null
	createdAt: Date
	updatedAt: Date
}

// For user creation
export interface CreateUserData {
	email: string
	password: string
	name?: string
}

// For user updates
export interface UpdateUserData {
	email?: string
	name?: string
}
```

**Location Model** (`/models/location/location-model.ts`):
```typescript
export interface Location {
	id: string
	name: string
	icon: string | null
	createdAt: Date
	updatedAt: Date
	userId: string
}

// With relations
export interface LocationWithUser extends Location {
	user: UserPublic
}

export interface LocationWithBoxes extends Location {
	boxes: Box[]
}

// Create/Update types
export interface CreateLocationData {
	name: string
	icon?: string
	userId: string
}

export interface UpdateLocationData {
	name?: string
	icon?: string
}
```

**Box Model** (`/models/box/box-model.ts`) - Future:
```typescript
export interface Box {
	id: string
	name: string
	description: string | null
	season: Season
	locationId: string

	// Set information
	isPartOfSet: boolean
	setName: string | null
	setPosition: number | null  // e.g., 1 for "1/3"
	setTotal: number | null     // e.g., 3 for "1/3"

	// Group information
	groupName: string | null

	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null  // Soft delete
}

// With relations
export interface BoxWithLocation extends Box {
	location: Location
}

export interface BoxWithContents extends Box {
	contents: Content[]
}

export interface BoxFull extends Box {
	location: Location
	contents: Content[]
}
```

#### Model Type Patterns

**1. Base Interface**: Matches database schema exactly
```typescript
export interface ModelName {
	id: string
	field1: string
	field2: number
	createdAt: Date
	updatedAt: Date
}
```

**2. Creation Type**: Only required fields for creation
```typescript
export interface CreateModelData {
	field1: string
	field2: number
	// No id, createdAt, updatedAt - auto-generated
}
```

**3. Update Type**: All fields optional
```typescript
export interface UpdateModelData {
	field1?: string
	field2?: number
}
```

**4. Public Type**: Safe for frontend (no sensitive data)
```typescript
export interface ModelPublic {
	id: string
	field1: string
	// No password, tokens, or other sensitive fields
}
```

**5. Extended Types**: With relations
```typescript
export interface ModelWithRelation extends ModelName {
	relation: RelatedModel
}
```

### 2. Responses (`/responses`)

**Purpose**: Standardized API response formats

#### BasicResponse (`basic-response.ts`)

**The Core Response Interface** - Used by ALL API routes and utils:

```typescript
export interface BasicResponse {
	success: boolean
	message?: string
	data: any
	error?: any
	code?: number
}
```

**Usage in Utils**:
```typescript
import { BasicResponse } from '@/types/responses/basic-response'

export const createUser = async (data: CreateUserData): Promise<BasicResponse> => {
	try {
		const user = await prisma.user.create({ data })
		return {
			success: true,
			message: 'User created successfully',
			data: user,
			code: 201
		}
	} catch (error) {
		return {
			success: false,
			message: 'Failed to create user',
			data: null,
			error: error,
			code: 500
		}
	}
}
```

**Usage in Components**:
```typescript
async function handleSubmit(values) {
	const res = await fetch('/api/user', {
		method: 'POST',
		body: JSON.stringify(values)
	})

	const data: BasicResponse = await res.json()

	if (data.success) {
		// Handle success - data.data contains the payload
		console.log(data.data)
	} else {
		// Handle error - data.error contains error details
		openModal(data.message || 'Operation failed')
	}
}
```

#### Typed Responses (Future Pattern)

Create specific response types for type-safe API responses:

```typescript
// responses/user-responses.ts
import { BasicResponse } from './basic-response'
import { User, UserPublic } from '../models/user/user-model'

export interface CreateUserResponse extends Omit<BasicResponse, 'data'> {
	data: UserPublic | null
}

export interface GetUsersResponse extends Omit<BasicResponse, 'data'> {
	data: UserPublic[] | null
}

export interface LoginResponse extends Omit<BasicResponse, 'data'> {
	data: {
		user: UserPublic
		token: string
	} | null
}
```

**Usage**:
```typescript
// In utils
export const createUser = async (data: CreateUserData): Promise<CreateUserResponse> => {
	// ... implementation
	return {
		success: true,
		data: userWithoutPassword,
		code: 201
	}
}

// In components
const res = await fetch('/api/user', { method: 'POST', body: JSON.stringify(values) })
const response: CreateUserResponse = await res.json()

if (response.success && response.data) {
	// TypeScript knows response.data is UserPublic
	console.log(response.data.email)
}
```

### 3. Requests (`/requests`)

**Purpose**: Type definitions for API request payloads

**Future Pattern**:

```typescript
// requests/user-requests.ts
export interface CreateUserRequest {
	name: string
	email: string
	password: string
}

export interface UpdateUserRequest {
	name?: string
	email?: string
}

export interface LoginRequest {
	email: string
	password: string
}

// requests/box-requests.ts
export interface CreateBoxRequest {
	name: string
	description?: string
	season: Season
	locationId: string
	isPartOfSet: boolean
	setName?: string
	setPosition?: number
	setTotal?: number
	groupName?: string
}

export interface UpdateBoxRequest {
	name?: string
	description?: string
	season?: Season
	locationId?: string
	groupName?: string
}
```

**Usage in API Routes**:
```typescript
import { CreateBoxRequest } from '@/types/requests/box-requests'

export async function POST(req: NextRequest) {
	const body: CreateBoxRequest = await req.json()

	// Validate with Zod schema
	const validated = createBoxSchema.safeParse(body)
	if (!validated.success) {
		return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
	}

	// TypeScript knows the shape of validated.data
	const result = await createBox(validated.data)
	return NextResponse.json(result)
}
```

## Enums and Constants

### Season Enum (Future)

```typescript
// types/enums/season.ts
export enum Season {
	CHRISTMAS = 'christmas',
	HALLOWEEN = 'halloween',
	EASTER = 'easter',
	SUMMER = 'summer',
	GENERIC = 'generic'
}

// Or as const for literal types
export const SEASONS = {
	CHRISTMAS: 'christmas',
	HALLOWEEN: 'halloween',
	EASTER: 'easter',
	SUMMER: 'summer',
	GENERIC: 'generic'
} as const

export type Season = typeof SEASONS[keyof typeof SEASONS]
```

**Usage**:
```typescript
import { Season, SEASONS } from '@/types/enums/season'

const box: Box = {
	id: '123',
	name: 'Christmas Lights',
	season: SEASONS.CHRISTMAS,  // Type-safe
	// ...
}
```

## Type Utilities

### Common Utility Types

```typescript
// types/utils.ts

// Make specific fields required
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

// Make specific fields optional
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Omit multiple fields
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>

// Example usage:
type UserWithRequiredName = WithRequired<User, 'name'>
```

### Prisma Type Extraction

Since Prisma generates types, you can extract them:

```typescript
// types/models/user/user-model.ts
import { Prisma } from '@/generated/prisma'

// Use Prisma-generated types
export type User = Prisma.UserGetPayload<{}>

// With relations
export type UserWithLocations = Prisma.UserGetPayload<{
	include: { locations: true }
}>

// Specific fields only
export type UserPublic = Prisma.UserGetPayload<{
	select: {
		id: true
		email: true
		name: true
		createdAt: true
		updatedAt: true
	}
}>

// Create input type
export type CreateUserInput = Prisma.UserCreateInput
```

## Type Organization Best Practices

### File Structure

**One file per model** in appropriate subdirectory:
```
types/
├── models/
│   ├── user/
│   │   ├── user-model.ts      # User, UserPublic, CreateUserData, etc.
│   │   └── user-types.ts      # Additional user-related types
│   ├── box/
│   │   ├── box-model.ts
│   │   └── box-types.ts
│   └── location/
│       └── location-model.ts
```

### Naming Conventions

**Interfaces**: PascalCase
```typescript
export interface User { }
export interface CreateUserData { }
```

**Types**: PascalCase
```typescript
export type UserId = string
export type Season = 'christmas' | 'halloween' | 'easter' | 'summer' | 'generic'
```

**Enums**: PascalCase for enum name, UPPER_CASE for values
```typescript
export enum Season {
	CHRISTMAS = 'christmas',
	HALLOWEEN = 'halloween'
}
```

### Barrel Exports

Use `index.ts` files to re-export types:

```typescript
// types/models/index.ts
export * from './user/user-model'
export * from './location/location-model'
export * from './box/box-model'

// types/index.ts
export * from './models'
export * from './responses'
export * from './requests'
```

**Usage in components**:
```typescript
import { User, Location, BasicResponse } from '@/types'
```

## Integration with Zod Schemas

Zod schemas (in `/utils/forms/schemas`) should match type definitions:

```typescript
// utils/forms/schemas/create-user-form.ts
import * as z from 'zod'

export const createUserSchema = z.object({
	name: z.string().min(5).max(32),
	email: z.string().email().max(100),
	password: z.string().min(8).max(32)
})

// Extract TypeScript type from Zod schema
export type CreateUserFormData = z.infer<typeof createUserSchema>
```

**This type should match**:
```typescript
// types/models/user/user-model.ts
export interface CreateUserData {
	name: string
	email: string
	password: string
}
```

**Pattern**: Define Zod schema, then infer type OR define type and ensure schema matches

## Common Type Patterns

### Optional Fields Pattern
```typescript
// Database might have nullable fields
export interface User {
	id: string
	email: string
	name: string | null  // Nullable in database
}

// But forms might require it
export interface CreateUserData {
	email: string
	name: string  // Required in form
}
```

### Date Handling
```typescript
// API/Database returns Date
export interface User {
	createdAt: Date
}

// But JSON parsing converts to string
export interface UserJSON {
	createdAt: string
}

// Utility to convert
export function parseUserDates(user: UserJSON): User {
	return {
		...user,
		createdAt: new Date(user.createdAt)
	}
}
```

### Discriminated Unions
```typescript
type BoxStandalone = {
	type: 'standalone'
	name: string
}

type BoxInSet = {
	type: 'set'
	name: string
	setPosition: number
	setTotal: number
}

export type Box = BoxStandalone | BoxInSet

// Usage with type narrowing
function getBoxLabel(box: Box): string {
	if (box.type === 'set') {
		// TypeScript knows box has setPosition and setTotal
		return `${box.name} ${box.setPosition}/${box.setTotal}`
	}
	return box.name
}
```

## Development Checklist

When creating new types:

- [ ] Place in appropriate domain folder
- [ ] Use PascalCase for interface/type names
- [ ] Create base interface matching database schema
- [ ] Create Create/Update variant types
- [ ] Create Public variant (no sensitive data) if needed
- [ ] Create Extended variants (with relations) if needed
- [ ] Export from domain `index.ts`
- [ ] Export from root `index.ts`
- [ ] Ensure Zod schemas match types
- [ ] Document complex types with JSDoc comments

## Best Practices

### DO
✅ Define types for all data structures
✅ Use strict TypeScript (`strict: true`)
✅ Prefer interfaces over types for object shapes
✅ Use types for unions and intersections
✅ Create specific types for requests and responses
✅ Mirror database schema in model types
✅ Use Prisma-generated types when possible
✅ Document complex types with comments
✅ Export types from barrel files

### DON'T
❌ Use `any` - always provide proper types
❌ Skip typing function parameters and returns
❌ Create overly complex nested types
❌ Duplicate type definitions across files
❌ Use type assertions (`as`) unnecessarily
❌ Forget to update types when schema changes
❌ Mix interfaces and types inconsistently

## Future Enhancements

### Planned Type Categories

**QR Code Types**:
```typescript
export interface QRCodeData {
	boxId: string
	locationId: string
	season: Season
	timestamp: Date
}

export interface GenerateQRRequest {
	boxId: string
	size?: number
	format?: 'png' | 'svg'
}
```

**Label Types**:
```typescript
export interface BoxLabel {
	qrCode: string  // Base64 or URL
	boxName: string
	seasonIcon: string
	setInfo?: string  // "1/3"
	groupName?: string
}

export interface GenerateLabelRequest {
	boxId: string
	format: 'png' | 'pdf'
}
```

**Search/Filter Types**:
```typescript
export interface BoxSearchParams {
	query?: string
	season?: Season
	locationId?: string
	groupName?: string
}

export interface PaginationParams {
	page: number
	limit: number
}
```

## Summary

Types are the foundation of type-safe development. They provide:
- **Compile-time safety**: Catch errors before runtime
- **IntelliSense**: Better IDE autocomplete
- **Documentation**: Self-documenting code
- **Refactoring confidence**: Safe to rename and restructure

Always define types for all data structures and leverage TypeScript's type system to its fullest.
