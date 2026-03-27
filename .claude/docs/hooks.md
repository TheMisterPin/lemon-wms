# src/hooks/ Documentation

## Overview
Custom React hooks that encapsulate reusable stateful logic across the application. Hooks provide clean abstractions for common patterns like authentication state, error handling, loading management, and logging.

## Directory Structure

```
src/hooks/
├── auth/                    # Authentication state management
│   └── auth-context.tsx
├── log/                     # Logging and debugging
│   ├── use-console-logger.tsx
│   └── use-console-recall.tsx
└── ui/                      # UI state management
    ├── error-modal-context.tsx
    ├── use-loading-manager.tsx
    ├── use-toast.ts
    └── use-mobile.ts
```

## Hook Categories

### 1. Authentication (`/auth`)

#### `auth-context.tsx`
**Purpose**: Global authentication state management

**Exports**:
- `AuthProvider` - Context provider component
- `useAuth()` - Hook to access auth state and actions

**Pattern**:
```typescript
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
	user: User | null
	token: string | null
	login: (email: string, password: string) => Promise<void>
	logout: () => void
	isAuthenticated: boolean
	isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	// Initialize auth state from localStorage
	useEffect(() => {
		const storedToken = localStorage.getItem('token')
		if (storedToken) {
			// Validate token and load user
			setToken(storedToken)
		}
		setIsLoading(false)
	}, [])

	const login = async (email: string, password: string) => {
		// Call login API
		// Store token
		// Set user state
	}

	const logout = () => {
		localStorage.removeItem('token')
		setToken(null)
		setUser(null)
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				login,
				logout,
				isAuthenticated: !!token,
				isLoading
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
```

**Usage in Components**:
```typescript
import { useAuth } from '@/hooks/auth/auth-context'

function MyComponent() {
	const { user, login, logout, isAuthenticated } = useAuth()

	if (!isAuthenticated) {
		return <LoginForm />
	}

	return (
		<div>
			<p>Welcome, {user?.name}</p>
			<button onClick={logout}>Logout</button>
		</div>
	)
}
```

**Setup in App Layout**:
```typescript
// app/layout.tsx
import { AuthProvider } from '@/hooks/auth/auth-context'

export default function RootLayout({ children }) {
	return (
		<html>
			<body>
				<AuthProvider>
					{children}
				</AuthProvider>
			</body>
		</html>
	)
}
```

### 2. Logging (`/log`)

#### `use-console-logger.tsx`
**Purpose**: Structured console logging for debugging and user feedback

**Features**:
- Categorized logging (info, warn, error, success)
- Persistent log storage
- Searchable log history
- User-friendly log viewing

**Usage**:
```typescript
import { useConsoleLogger } from '@/hooks/log/use-console-logger'

function MyComponent() {
	const logger = useConsoleLogger('MyComponent')

	const handleAction = async () => {
		logger.info('Starting action')

		try {
			await performAction()
			logger.success('Action completed successfully')
		} catch (error) {
			logger.error('Action failed', error)
		}
	}

	return <button onClick={handleAction}>Do Action</button>
}
```

#### `use-console-recall.tsx`
**Purpose**: Log recall and download functionality

**Features**:
- Retrieve historical logs
- Filter logs by category or component
- Export logs to file
- Clear log history

**Usage**:
```typescript
import { useConsoleRecall } from '@/hooks/log/use-console-recall'

function LogViewer() {
	const { logs, clearLogs, downloadLogs } = useConsoleRecall()

	return (
		<div>
			<button onClick={downloadLogs}>Download Logs</button>
			<button onClick={clearLogs}>Clear Logs</button>
			<ul>
				{logs.map((log, i) => (
					<li key={i}>{log.message}</li>
				))}
			</ul>
		</div>
	)
}
```

### 3. UI State Management (`/ui`)

#### `error-modal-context.tsx` ⭐ PRIMARY ERROR HANDLING
**Purpose**: Global error modal for user-facing error messages

**Why This is Critical**:
- Provides consistent error UX across the app
- Centralizes error display logic
- Prevents error handling code duplication
- Ensures users always see friendly error messages

**Implementation Pattern**:
```typescript
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ErrorModalContextType {
	openModal: (message: string, title?: string) => void
	closeModal: () => void
}

const ErrorModalContext = createContext<ErrorModalContextType | undefined>(undefined)

export function ErrorModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [errorTitle, setErrorTitle] = useState('Error')

	const openModal = (message: string, title = 'Error') => {
		setErrorMessage(message)
		setErrorTitle(title)
		setIsOpen(true)
	}

	const closeModal = () => {
		setIsOpen(false)
		setErrorMessage('')
		setErrorTitle('Error')
	}

	return (
		<ErrorModalContext.Provider value={{ openModal, closeModal }}>
			{children}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{errorTitle}</DialogTitle>
					</DialogHeader>
					<p>{errorMessage}</p>
					<Button onClick={closeModal}>OK</Button>
				</DialogContent>
			</Dialog>
		</ErrorModalContext.Provider>
	)
}

export function useErrorModal() {
	const context = useContext(ErrorModalContext)
	if (!context) {
		throw new Error('useErrorModal must be used within ErrorModalProvider')
	}
	return context
}
```

**Usage in Components** (REQUIRED PATTERN):
```typescript
import { useErrorModal } from '@/hooks/ui/error-modal-context'

function MyForm() {
	const { openModal } = useErrorModal()

	async function handleSubmit(values) {
		try {
			const res = await fetch('/api/endpoint', {
				method: 'POST',
				body: JSON.stringify(values)
			})

			if (!res.ok) {
				const payload = await res.json().catch(() => null)
				openModal(payload?.error ?? 'Operation failed')
				return
			}

			// Success handling
		} catch (error) {
			openModal('An unexpected error occurred')
		}
	}
}
```

**Setup Required**:
```typescript
// app/layout.tsx
import { ErrorModalProvider } from '@/hooks/ui/error-modal-context'

export default function RootLayout({ children }) {
	return (
		<html>
			<body>
				<ErrorModalProvider>
					{children}
				</ErrorModalProvider>
			</body>
		</html>
	)
}
```

#### `use-loading-manager.tsx`
**Purpose**: Centralized loading state management (global and component-specific)

**Features**:
- Global loading state (app-wide spinner)
- Component-specific loading states
- Loading messages
- Clear all loading utility

**Architecture**:
```typescript
'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface LoadingState {
	isLoading: boolean
	message?: string
	component?: string
}

interface LoadingContextType {
	globalLoading: LoadingState
	componentLoading: Record<string, LoadingState>
	setGlobalLoading: (loading: boolean, message?: string) => void
	setComponentLoading: (componentId: string, loading: boolean, message?: string) => void
	clearAllLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }) {
	const [globalLoading, setGlobalLoadingState] = useState<LoadingState>({ isLoading: false })
	const [componentLoading, setComponentLoadingState] = useState<Record<string, LoadingState>>({})

	const setGlobalLoading = useCallback((loading: boolean, message?: string) => {
		setGlobalLoadingState({ isLoading: loading, message })
	}, [])

	const setComponentLoading = useCallback(
		(componentId: string, loading: boolean, message?: string) => {
			setComponentLoadingState(prev => ({
				...prev,
				[componentId]: { isLoading: loading, message, component: componentId }
			}))
		},
		[]
	)

	const clearAllLoading = useCallback(() => {
		setGlobalLoadingState({ isLoading: false })
		setComponentLoadingState({})
	}, [])

	return (
		<LoadingContext.Provider
			value={{
				globalLoading,
				componentLoading,
				setGlobalLoading,
				setComponentLoading,
				clearAllLoading
			}}
		>
			{children}
		</LoadingContext.Provider>
	)
}
```

**Convenience Hooks**:

**1. Global Loading**:
```typescript
export function useGlobalLoading() {
	const { globalLoading, setGlobalLoading } = useLoadingManager()

	const startLoading = useCallback(
		(message?: string) => setGlobalLoading(true, message),
		[setGlobalLoading]
	)

	const stopLoading = useCallback(
		() => setGlobalLoading(false),
		[setGlobalLoading]
	)

	return {
		isLoading: globalLoading.isLoading,
		message: globalLoading.message,
		startLoading,
		stopLoading
	}
}

// Usage
function MyPage() {
	const { isLoading, startLoading, stopLoading } = useGlobalLoading()

	useEffect(() => {
		startLoading('Loading data...')
		fetchData().then(() => stopLoading())
	}, [])

	if (isLoading) return <Spinner />
	return <Content />
}
```

**2. Component Loading**:
```typescript
export function useComponentLoading(componentId: string) {
	const { componentLoading, setComponentLoading } = useLoadingManager()
	const loading = componentLoading[componentId] || { isLoading: false }

	const startLoading = useCallback(
		(message?: string) => setComponentLoading(componentId, true, message),
		[componentId, setComponentLoading]
	)

	const stopLoading = useCallback(
		() => setComponentLoading(componentId, false),
		[componentId, setComponentLoading]
	)

	return {
		isLoading: loading.isLoading,
		message: loading.message,
		startLoading,
		stopLoading
	}
}

// Usage
function UserList() {
	const { isLoading, startLoading, stopLoading } = useComponentLoading('user-list')

	const loadUsers = async () => {
		startLoading('Loading users...')
		await fetchUsers()
		stopLoading()
	}

	return (
		<div>
			{isLoading ? <Spinner /> : <UserTable />}
		</div>
	)
}
```

**When to Use Which**:
- **Global Loading**: Page navigation, app-wide operations
- **Component Loading**: Individual component operations (forms, lists, cards)

#### `use-toast.ts`
**Purpose**: Toast notification system for temporary messages

**Usage**:
```typescript
import { useToast } from '@/hooks/ui/use-toast'

function MyComponent() {
	const { toast } = useToast()

	const handleSuccess = () => {
		toast({
			title: 'Success',
			description: 'Your changes have been saved.',
			variant: 'default'
		})
	}

	const handleError = () => {
		toast({
			title: 'Error',
			description: 'Something went wrong.',
			variant: 'destructive'
		})
	}

	return <button onClick={handleSuccess}>Save</button>
}
```

**When to Use Toast vs Error Modal**:
- **Toast**: Success messages, non-critical info, temporary notifications
- **Error Modal**: Errors that require user acknowledgment, critical failures

#### `use-mobile.ts`
**Purpose**: Responsive design helper for mobile detection

**Usage**:
```typescript
import { useMobile } from '@/hooks/ui/use-mobile'

function MyComponent() {
	const isMobile = useMobile()

	return (
		<div>
			{isMobile ? <MobileView /> : <DesktopView />}
		</div>
	)
}
```

## Hook Development Guidelines

### Creating a New Hook

**1. File Naming**:
- Use `use-` prefix: `use-my-hook.ts`
- Use kebab-case: `use-loading-manager.ts`

**2. Hook Pattern**:
```typescript
'use client'  // If using React state/effects

import { useState, useEffect } from 'react'

export function useMyHook(param?: string) {
	const [state, setState] = useState(initialValue)

	useEffect(() => {
		// Side effects
	}, [dependencies])

	const action = () => {
		// Logic
	}

	return { state, action }
}
```

**3. Context Pattern** (for global state):
```typescript
'use client'

import { createContext, useContext, useState } from 'react'

interface MyContextType {
	// ... context shape
}

const MyContext = createContext<MyContextType | undefined>(undefined)

export function MyProvider({ children }) {
	// ... state and logic

	return (
		<MyContext.Provider value={/* ... */}>
			{children}
		</MyContext.Provider>
	)
}

export function useMyContext() {
	const context = useContext(MyContext)
	if (!context) {
		throw new Error('useMyContext must be used within MyProvider')
	}
	return context
}
```

### Hook Best Practices

**DO**:
- ✅ Always use `'use client'` directive for hooks with state/effects
- ✅ Provide TypeScript types for all parameters and return values
- ✅ Throw descriptive errors when context is used outside provider
- ✅ Use `useCallback` for function returns to prevent unnecessary re-renders
- ✅ Use `useMemo` for expensive computed values
- ✅ Document hook purpose and usage with comments
- ✅ Export both provider and hook from context files
- ✅ Keep hooks focused on a single responsibility

**DON'T**:
- ❌ Create hooks with business logic - put that in `/utils`
- ❌ Make API calls directly in hooks - hooks should call utils
- ❌ Create hooks without TypeScript types
- ❌ Forget error boundaries for context hooks
- ❌ Create deeply nested provider trees
- ❌ Use hooks conditionally (breaks React rules)

## Context Providers Setup

**All context providers must be added to the root layout**:

```typescript
// app/layout.tsx
import { AuthProvider } from '@/hooks/auth/auth-context'
import { ErrorModalProvider } from '@/hooks/ui/error-modal-context'
import { LoadingProvider } from '@/hooks/ui/use-loading-manager'
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }) {
	return (
		<html>
			<body>
				<AuthProvider>
					<LoadingProvider>
						<ErrorModalProvider>
							{children}
							<Toaster />
						</ErrorModalProvider>
					</LoadingProvider>
				</AuthProvider>
			</body>
		</html>
	)
}
```

**Provider Order Matters**:
1. AuthProvider (outermost - needed by all)
2. LoadingProvider
3. ErrorModalProvider
4. Other providers

## Common Patterns

### Combining Multiple Hooks
```typescript
function MyComponent() {
	const { user, isAuthenticated } = useAuth()
	const { openModal } = useErrorModal()
	const { startLoading, stopLoading } = useComponentLoading('my-component')
	const { toast } = useToast()

	const handleAction = async () => {
		if (!isAuthenticated) {
			openModal('Please log in to continue')
			return
		}

		startLoading('Processing...')

		try {
			const result = await performAction()
			toast({
				title: 'Success',
				description: 'Action completed'
			})
		} catch (error) {
			openModal('Action failed')
		} finally {
			stopLoading()
		}
	}

	return <button onClick={handleAction}>Do Action</button>
}
```

### Protected Route Pattern
```typescript
function ProtectedPage() {
	const { isAuthenticated, isLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login')
		}
	}, [isAuthenticated, isLoading, router])

	if (isLoading) return <Spinner />
	if (!isAuthenticated) return null

	return <PageContent />
}
```

## Future Enhancements

### Planned Hooks

**Authentication**:
- `usePermissions()` - Role-based access control
- `useTokenRefresh()` - Automatic token renewal

**Data Management**:
- `useLocalStorage()` - Persistent local storage
- `useDebounce()` - Debounced values for search inputs

**UI**:
- `useMediaQuery()` - Responsive breakpoints
- `useTheme()` - Dark/light mode management
- `useKeyboardShortcuts()` - Global keyboard shortcuts

**Forms**:
- `useFormPersist()` - Auto-save form state
- `useMultiStepForm()` - Wizard/multi-step forms

## Testing Hooks

**Future Pattern** (post-MVP):
```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '@/hooks/use-my-hook'

describe('useMyHook', () => {
	it('should initialize with default state', () => {
		const { result } = renderHook(() => useMyHook())
		expect(result.current.state).toBe(initialValue)
	})

	it('should update state on action', () => {
		const { result } = renderHook(() => useMyHook())

		act(() => {
			result.current.action()
		})

		expect(result.current.state).toBe(expectedValue)
	})
})
```

## Summary

Hooks are the glue that connects UI components with application state and logic. They provide clean abstractions for:

- **State Management**: Auth, loading, errors
- **Side Effects**: Logging, data fetching
- **UI Patterns**: Toasts, modals, responsive behavior

Always prefer using existing hooks over creating new ones, and keep hooks focused on state management - not business logic.
