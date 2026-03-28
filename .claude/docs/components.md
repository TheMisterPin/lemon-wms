# src/_components/ Documentation

## Overview
The `_components` directory contains custom, application-specific components built on top of the base shadcn/ui library. These components implement the business logic and UI patterns unique to the Holiday Storage Manager application.

## Directory Structure

```
src/_components/
├── cards/          # Display components for showing data
├── forms/          # Form components with validation and submission
├── modals/         # Modal dialogs for user interactions
└── pages/          # Full page components
```

## Organization Principles

### Atomic Design Pattern
Components in `_components` are **organisms** and **pages** in the atomic design hierarchy:
- **Atoms**: Base UI elements (in `/components/ui`)
- **Molecules**: Simple combinations (in `/components` root)
- **Organisms**: Complex combinations (in `/_components`)
- **Pages**: Full page layouts (`/_components/pages`)

### File Naming Convention
- Use **kebab-case** for all component files: `create-user-form.tsx`, `user-card.tsx`
- Each file contains a **single component**
- Component names use **PascalCase**: `CreateUserForm`, `UserCard`

## Component Categories

### 1. Cards (`/cards`)
**Purpose**: Display components that present data in card format

**Current Components**:
- `user-card.tsx` - Displays user information

**Patterns**:
```typescript
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface UserCardProps {
	user: User
	// ... other props
}

export function UserCard({ user }: UserCardProps) {
	return (
		<Card>
			<CardHeader>{/* ... */}</CardHeader>
			<CardContent>{/* ... */}</CardContent>
		</Card>
	)
}
```

**Guidelines**:
- Must accept data via props (no direct API calls)
- Use shadcn Card components as base
- Keep display logic only - no business logic
- Include TypeScript interfaces for all props

### 2. Forms (`/forms`)
**Purpose**: Form components with validation, submission, and error handling

**Current Components**:
- `create-user-form.tsx` - User registration form
- `create-location-form.tsx` - Location creation form
- `login-form.tsx` - User authentication form

**Standard Form Pattern**:
```typescript
'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useErrorModal } from '@/hooks/ui/error-modal-context'
import { formSchema } from '@/utils/forms/schemas/form-name'

export function MyForm() {
	const [serverSuccess, setServerSuccess] = useState<string | null>(null)
	const { openModal } = useErrorModal()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			// ... field defaults
		},
		mode: 'onSubmit',
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setServerSuccess(null)

		try {
			const res = await fetch('/api/endpoint', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			})

			if (!res.ok) {
				const payload = await res.json().catch(() => null)
				openModal(payload?.error ?? 'Failed to submit')
				return
			}

			setServerSuccess('Success message')
			form.reset()
		} catch {
			openModal('Failed to submit')
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{/* FormFields */}
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
				</Button>
			</form>
		</Form>
	)
}
```

**Form Guidelines**:
1. **Always use `'use client'`** directive at the top
2. **Schema location**: Define Zod schemas in `/utils/forms/schemas/[form-name].ts`
3. **Error handling**: Use `useErrorModal` hook for error display
4. **Success feedback**: Use local state for success messages
5. **Loading states**: Use `form.formState.isSubmitting` for button states
6. **Reset on success**: Call `form.reset()` after successful submission
7. **Mode**: Use `mode: 'onSubmit'` for validation timing
8. **Fetch pattern**: Use native `fetch` with proper error handling

**Required Imports**:
```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useErrorModal } from '@/hooks/ui/error-modal-context'
```

### 3. Modals (`/modals`)
**Purpose**: Dialog components that overlay the main content

**Current Components**:
- `create-user-modal.tsx` - Modal wrapper for user creation form

**Modal Pattern**:
```typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MyForm } from '@/_components/forms/my-form'

export function MyModal() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open Modal</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Modal Title</DialogTitle>
				</DialogHeader>
				<MyForm />
			</DialogContent>
		</Dialog>
	)
}
```

**Guidelines**:
- Use shadcn Dialog components
- Keep modals simple - they should compose other components
- Forms inside modals should handle their own submission logic
- Use `DialogTrigger` with `asChild` for custom trigger buttons

### 4. Pages (`/pages`)
**Purpose**: Full page layouts and compositions

**Current Components**:
- `login-page.tsx` - Login page layout

**Page Pattern**:
```typescript
'use client'

import { MyForm } from '@/_components/forms/my-form'
import { MyCard } from '@/_components/cards/my-card'

export function MyPage() {
	return (
		<div className="container mx-auto p-4">
			<h1>Page Title</h1>
			{/* Compose forms, cards, modals, etc. */}
		</div>
	)
}
```

**Guidelines**:
- Pages compose multiple components
- Handle page-level state and data fetching
- Use consistent layout patterns (container, padding, spacing)

## Component Development Checklist

When creating a new component in `_components`:

- [ ] Use `'use client'` directive if component uses hooks or interactivity
- [ ] Follow kebab-case naming for files
- [ ] Define TypeScript interfaces for all props
- [ ] Use appropriate shadcn base components
- [ ] For forms: create corresponding Zod schema in `/utils/forms/schemas/`
- [ ] Implement error handling with `useErrorModal`
- [ ] Add loading states where appropriate
- [ ] Keep business logic in `/utils` - components should only handle UI
- [ ] Test form validation and submission flows
- [ ] Use consistent spacing (Tailwind classes like `space-y-4`)

## Common Patterns

### Error Handling
```typescript
import { useErrorModal } from '@/hooks/ui/error-modal-context'

const { openModal } = useErrorModal()

// In catch block or error condition
openModal('User-friendly error message')
```

### Loading States
```typescript
// Form submission
<Button type="submit" disabled={form.formState.isSubmitting}>
	{form.formState.isSubmitting ? 'Loading...' : 'Submit'}
</Button>

// Component-level loading
import { useComponentLoading } from '@/hooks/ui/use-loading-manager'

const { isLoading, startLoading, stopLoading } = useComponentLoading('my-component')
```

### Success Feedback
```typescript
const [serverSuccess, setServerSuccess] = useState<string | null>(null)

// After successful operation
setServerSuccess('Success message')

// In JSX
{serverSuccess && (
	<p className="text-sm" role="status">
		{serverSuccess}
	</p>
)}
```

## Best Practices

### DO
✅ Keep components focused on a single responsibility
✅ Extract reusable logic into custom hooks
✅ Use TypeScript for all props and state
✅ Follow the established form pattern for consistency
✅ Use shadcn components as building blocks
✅ Handle errors gracefully with user-friendly messages
✅ Show loading states during async operations
✅ Reset forms after successful submission

### DON'T
❌ Put business logic in components - use `/utils` instead
❌ Make direct database calls from components
❌ Modify shadcn components in `/components/ui`
❌ Create components without TypeScript types
❌ Skip error handling
❌ Forget to show loading states
❌ Use inline styles - use Tailwind classes
❌ Create multiple components per file

## Integration with Other Layers

### Components → API Routes
```typescript
// Components call API routes via fetch
const res = await fetch('/api/user', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(values),
})
```

### Components → Hooks
```typescript
// Use custom hooks for shared functionality
const { openModal } = useErrorModal()
const { isLoading, startLoading, stopLoading } = useComponentLoading('id')
const { user, logout } = useAuth()
```

### Components → Types
```typescript
// Import types from /types
import { User } from '@/types/models/user-model'
import { BasicResponse } from '@/types/responses/basic-response'
```

## Future Enhancements

- Add components for Box management (create, edit, list)
- Add components for QR code generation and display
- Add components for label printing
- Add image upload components for seasonal icons
- Add search and filter components
- Add pagination components for large lists
