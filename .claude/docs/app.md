# src/app/ Documentation

## Overview
The `app` directory follows Next.js 15 App Router conventions, containing all application routes, pages, layouts, and API endpoints. This directory defines the URL structure and rendering behavior of the application.

## Directory Structure

```
src/app/
├── (auth)/                  # Route group - authenticated routes
│   └── page.tsx            # Dashboard/home page (requires auth)
├── api/                     # API routes (see api.md for details)
│   ├── auth/
│   │   └── login/
│   │       └── route.ts
│   ├── location/
│   │   └── route.ts
│   └── user/
│       └── route.ts
├── users/                   # Users listing page
│   └── page.tsx
├── layout.tsx               # Root layout (wraps all pages)
├── page.tsx                 # Root page (/)
├── globals.css              # Global styles
└── favicon.ico              # Site favicon
```

## Next.js App Router Concepts

### File-Based Routing

Next.js uses file system for routing:
- `page.tsx` - Defines a page component for a route
- `layout.tsx` - Shared layout wrapper for child routes
- `route.ts` - API endpoint handler
- `loading.tsx` - Loading UI (future)
- `error.tsx` - Error boundary (future)
- `not-found.tsx` - 404 page (future)

### Route Groups

Folders wrapped in parentheses `(name)` are **route groups** - they organize files without affecting the URL:

```
app/
├── (auth)/          # Group: authenticated pages
│   ├── page.tsx    # URL: / (not /auth)
│   ├── boxes/
│   │   └── page.tsx  # URL: /boxes (not /auth/boxes)
├── (public)/        # Group: public pages
│   └── login/
│       └── page.tsx  # URL: /login (not /public/login)
```

**Purpose**: Organize routes by access level, feature, or layout without changing URLs

### Current Route Structure

```
URL: /                    → app/page.tsx (root page)
URL: /users              → app/users/page.tsx
URL: (authenticated)     → app/(auth)/page.tsx (future: protected)
```

## Core Files

### Root Layout (`layout.tsx`)

**Purpose**: Top-level layout that wraps all pages - runs on every page load

**Responsibilities**:
1. HTML document structure
2. Global providers (Auth, Loading, Error Modal)
3. Global styles
4. Metadata configuration
5. Font configuration

**Pattern**:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Context providers
import { AuthProvider } from '@/hooks/auth/auth-context'
import { LoadingProvider } from '@/hooks/ui/use-loading-manager'
import { ErrorModalProvider } from '@/hooks/ui/error-modal-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Holiday Storage Manager',
	description: 'Manage your seasonal decorations with ease',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>
					<LoadingProvider>
						<ErrorModalProvider>
							{children}
						</ErrorModalProvider>
					</LoadingProvider>
				</AuthProvider>
			</body>
		</html>
	)
}
```

**Important Notes**:
- Must export `metadata` object for SEO
- Must render `<html>` and `<body>` tags
- All context providers go here
- Runs on server by default (no 'use client' needed)
- Children receive all nested pages

### Root Page (`page.tsx`)

**Purpose**: Landing page at `/`

**Current Implementation**: Likely redirects or shows login/dashboard

**Pattern**:
```typescript
import { redirect } from 'next/navigation'

export default function HomePage() {
	// Could check auth and redirect
	// Or show landing page
	return (
		<main className="container mx-auto p-4">
			<h1>Welcome to Holiday Storage Manager</h1>
			{/* Content */}
		</main>
	)
}
```

**Future Pattern** (with auth):
```typescript
'use client'

import { useAuth } from '@/hooks/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
	const { isAuthenticated, isLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				router.push('/dashboard')
			} else {
				router.push('/login')
			}
		}
	}, [isAuthenticated, isLoading, router])

	return <div>Loading...</div>
}
```

### Global Styles (`globals.css`)

**Purpose**: Tailwind directives and global CSS

**Pattern**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global utility classes */
@layer base {
	:root {
		--background: 0 0% 100%;
		--foreground: 222.2 84% 4.9%;
		/* ... other CSS variables */
	}

	.dark {
		--background: 222.2 84% 4.9%;
		--foreground: 210 40% 98%;
		/* ... dark mode variables */
	}
}

@layer components {
	/* Custom component styles */
}

@layer utilities {
	/* Custom utility classes */
}
```

## Route Groups

### Authenticated Routes `(auth)/`

**Purpose**: Pages that require user authentication

**Current Structure**:
```
(auth)/
└── page.tsx    # Dashboard/home for logged-in users
```

**Future Structure**:
```
(auth)/
├── page.tsx              # Dashboard
├── boxes/
│   ├── page.tsx         # Boxes list
│   ├── [id]/
│   │   └── page.tsx     # Box detail
│   └── new/
│       └── page.tsx     # Create box
├── locations/
│   ├── page.tsx         # Locations list
│   └── [id]/
│       └── page.tsx     # Location detail
└── profile/
    └── page.tsx         # User profile
```

**Auth Protection Pattern**:

**Option 1**: Client-side (current approach)
```typescript
'use client'

import { useAuth } from '@/hooks/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
	const { isAuthenticated, isLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login')
		}
	}, [isAuthenticated, isLoading, router])

	if (isLoading) return <div>Loading...</div>
	if (!isAuthenticated) return null

	return <div>Protected content</div>
}
```

**Option 2**: Middleware (future - recommended)
```typescript
// middleware.ts (root level)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	const token = request.cookies.get('token')?.value

	if (!token) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// Validate token
	// ...

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/(auth)/:path*',  // Protect all routes in (auth) group
		'/api/:path*'      // Protect API routes
	]
}
```

### Public Routes (Future)

**Structure**:
```
(public)/
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
└── about/
    └── page.tsx
```

## Dynamic Routes

### Dynamic Segments

Use brackets for dynamic route parameters:

```
app/
├── boxes/
│   └── [id]/
│       └── page.tsx     # URL: /boxes/123

// In component:
export default function BoxDetailPage({ params }: { params: { id: string } }) {
	const boxId = params.id
	// ...
}
```

### Catch-All Routes

Use `[...slug]` for catch-all routes:

```
app/
├── docs/
│   └── [...slug]/
│       └── page.tsx     # Matches /docs/a, /docs/a/b, /docs/a/b/c

// In component:
export default function DocsPage({ params }: { params: { slug: string[] } }) {
	const segments = params.slug  // ['a', 'b', 'c']
	// ...
}
```

## Page Component Patterns

### Server Component (Default)

**When to use**: Static content, data fetching, SEO-important pages

```typescript
// No 'use client' directive = server component

import { getAllBoxes } from '@/utils/box'

export default async function BoxesPage() {
	// Can fetch data directly
	const boxes = await getAllBoxes()

	return (
		<div>
			<h1>Boxes</h1>
			{boxes.data?.map(box => (
				<div key={box.id}>{box.name}</div>
			))}
		</div>
	)
}
```

**Benefits**:
- Better SEO (rendered on server)
- Smaller client bundle
- Can access server-only resources
- Automatic code splitting

**Limitations**:
- No hooks (useState, useEffect)
- No browser APIs
- No event handlers

### Client Component

**When to use**: Interactive features, hooks, browser APIs, state

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InteractivePage() {
	const [count, setCount] = useState(0)
	const router = useRouter()

	return (
		<div>
			<button onClick={() => setCount(count + 1)}>
				Count: {count}
			</button>
			<button onClick={() => router.push('/other')}>
				Navigate
			</button>
		</div>
	)
}
```

### Hybrid Pattern (Recommended)

Keep parent as server component, use client components for interactive parts:

```typescript
// app/boxes/page.tsx (server component)
import { getAllBoxes } from '@/utils/box'
import { BoxList } from '@/_components/box-list'  // Client component

export default async function BoxesPage() {
	const boxes = await getAllBoxes()

	return (
		<div>
			<h1>Boxes</h1>
			<BoxList boxes={boxes.data || []} />  {/* Interactive component */}
		</div>
	)
}

// _components/box-list.tsx (client component)
'use client'

import { useState } from 'react'

export function BoxList({ boxes }) {
	const [filter, setFilter] = useState('')

	return (
		<div>
			<input value={filter} onChange={e => setFilter(e.target.value)} />
			{boxes.filter(b => b.name.includes(filter)).map(box => (
				<div key={box.id}>{box.name}</div>
			))}
		</div>
	)
}
```

## Navigation

### Link Component

**For client-side navigation**:
```typescript
import Link from 'next/link'

<Link href="/boxes">View Boxes</Link>
<Link href={`/boxes/${box.id}`}>View Box</Link>
```

### useRouter Hook

**For programmatic navigation** (client components only):
```typescript
'use client'

import { useRouter } from 'next/navigation'

export default function MyComponent() {
	const router = useRouter()

	const handleClick = () => {
		router.push('/boxes')
		// router.back()
		// router.refresh()
	}

	return <button onClick={handleClick}>Go to Boxes</button>
}
```

### redirect Function

**For server-side redirects**:
```typescript
import { redirect } from 'next/navigation'

export default async function MyPage() {
	const session = await getSession()

	if (!session) {
		redirect('/login')
	}

	return <div>Protected content</div>
}
```

## Loading States

### Loading UI

Create `loading.tsx` for automatic loading states:

```typescript
// app/boxes/loading.tsx
export default function Loading() {
	return <div className="flex justify-center p-8">Loading boxes...</div>
}
```

**Automatic behavior**: Shows while `page.tsx` is loading

### Suspense

Wrap specific components:
```typescript
import { Suspense } from 'react'

export default function Page() {
	return (
		<div>
			<h1>Page Title</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<AsyncComponent />
			</Suspense>
		</div>
	)
}
```

## Error Handling

### Error Boundary

Create `error.tsx` for error boundaries:

```typescript
'use client'  // Error components must be client components

import { useEffect } from 'react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div>
			<h2>Something went wrong!</h2>
			<button onClick={reset}>Try again</button>
		</div>
	)
}
```

### Not Found

Create `not-found.tsx` for 404 pages:

```typescript
export default function NotFound() {
	return (
		<div>
			<h2>Not Found</h2>
			<p>Could not find requested resource</p>
		</div>
	)
}
```

## Metadata

### Static Metadata

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Boxes',
	description: 'Manage your storage boxes',
}

export default function BoxesPage() {
	// ...
}
```

### Dynamic Metadata

```typescript
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
	const box = await getBox(params.id)

	return {
		title: box.name,
		description: box.description,
	}
}

export default function BoxDetailPage({ params }) {
	// ...
}
```

## Best Practices

### DO
✅ Use server components by default
✅ Add 'use client' only when needed (hooks, interactivity)
✅ Use route groups to organize without affecting URLs
✅ Implement loading and error states
✅ Use metadata for SEO
✅ Use Link for navigation (not `<a>` tags)
✅ Keep page components focused - delegate to `_components`
✅ Use TypeScript for all components
✅ Implement proper auth protection
✅ Use middleware for route protection

### DON'T
❌ Make every component a client component
❌ Fetch data in client components (use server components)
❌ Skip loading states
❌ Skip error boundaries
❌ Use `<a>` tags for internal navigation
❌ Put business logic in page components
❌ Skip metadata configuration
❌ Forget to handle unauthenticated states
❌ Mix public and protected routes without clear separation

## Common Patterns

### Protected Page Pattern
```typescript
// app/(auth)/dashboard/page.tsx
'use client'

import { useAuth } from '@/hooks/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
	const { isAuthenticated, isLoading, user } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login')
		}
	}, [isAuthenticated, isLoading, router])

	if (isLoading) return <div>Loading...</div>
	if (!isAuthenticated) return null

	return (
		<div>
			<h1>Welcome, {user?.name}</h1>
		</div>
	)
}
```

### Data Fetching Pattern
```typescript
// Server component
export default async function BoxesPage() {
	const result = await getAllBoxes()

	if (!result.success) {
		return <div>Error loading boxes</div>
	}

	return <BoxList boxes={result.data} />
}
```

### Form Page Pattern
```typescript
'use client'

import { CreateBoxForm } from '@/_components/forms/create-box-form'

export default function NewBoxPage() {
	return (
		<div className="container mx-auto p-4">
			<h1>Create New Box</h1>
			<CreateBoxForm />
		</div>
	)
}
```

## Future Route Structure

**Recommended organization**:

```
app/
├── (auth)/              # Protected routes
│   ├── page.tsx        # Dashboard
│   ├── boxes/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   ├── locations/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── profile/
│       └── page.tsx
├── (public)/            # Public routes
│   ├── login/
│   │   └── page.tsx
│   └── about/
│       └── page.tsx
├── api/                 # API routes
├── layout.tsx
├── page.tsx            # Root redirect
└── not-found.tsx       # 404 page
```

## Summary

The `app` directory defines your application's structure using Next.js App Router conventions. Key points:

- **File-based routing**: URLs determined by folder structure
- **Server components by default**: Better performance and SEO
- **Client components when needed**: 'use client' for interactivity
- **Route groups**: Organize without affecting URLs
- **Layouts**: Share UI between routes
- **Loading/Error states**: Better UX
- **Metadata**: SEO optimization

Always prefer server components and only use client components when you need hooks, browser APIs, or event handlers.
