'use client'

import {
  createContext,
  useContext
} from 'react'
import type { ReactNode } from 'react'

// ── API response shapes ──────────────────────────────────────────────

type ApiPayload<T> = { success: boolean; data: T }

// ── Mutation error shape (matches ErrorModal props) ──────────────────

export interface MutationError {
  message: string
  code?: string
  details?: unknown
}

// ── Context value ────────────────────────────────────────────────────

interface WarehouseContextValue {
warehouseID : string | null
isLoading: boolean
error: string | null
}

const WarehouseContext = createContext<WarehouseContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────

export function WarehouseProvider({ children }: { children: ReactNode }) {

}

// ── Hook ─────────────────────────────────────────────────────────────

export function useWarehouse() {
  const context = useContext(WarehouseContext)

  if (!context) {
    throw new Error(
      'useWarehouse must be used within a WarehouseProvider'
    )
  }

  return context
}
