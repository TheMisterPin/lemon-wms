'use client'

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'

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

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [globalLoading, setGlobalLoadingState] = useState<LoadingState>({ isLoading: false })
  const [componentLoading, setComponentLoadingState] = useState<Record<string, LoadingState>>({})

  const setGlobalLoading = useCallback((loading: boolean, message?: string) => {
    setGlobalLoadingState({ isLoading: loading, message })
  }, [])

  const setComponentLoading = useCallback((componentId: string, loading: boolean, message?: string) => {
    setComponentLoadingState((prev) => ({
      ...prev,
      [componentId]: { isLoading: loading, message, component: componentId },
    }))
  }, [])

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
        clearAllLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoadingManager() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoadingManager must be used within a LoadingProvider')
  }
  return context
}

// Convenience hooks for specific use cases
export function useGlobalLoading() {
  const { globalLoading, setGlobalLoading } = useLoadingManager()

  const startLoading = useCallback(
    (message?: string) => {
      setGlobalLoading(true, message)
    },
    [setGlobalLoading],
  )

  const stopLoading = useCallback(() => {
    setGlobalLoading(false)
  }, [setGlobalLoading])

  return {
    isLoading: globalLoading.isLoading,
    message: globalLoading.message,
    startLoading,
    stopLoading,
  }
}

export function useComponentLoading(componentId: string) {
  const { componentLoading, setComponentLoading } = useLoadingManager()
  const loading = componentLoading[componentId] || { isLoading: false }

  const startLoading = useCallback(
    (message?: string) => {
      setComponentLoading(componentId, true, message)
    },
    [componentId, setComponentLoading],
  )

  const stopLoading = useCallback(() => {
    setComponentLoading(componentId, false)
  }, [componentId, setComponentLoading])

  return {
    isLoading: loading.isLoading,
    message: loading.message,
    startLoading,
    stopLoading,
  }
}
