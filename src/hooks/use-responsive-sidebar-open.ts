'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

import { SIDEBAR_DESKTOP_MIN_MEDIA } from '@/lib/utils'

/**
 * Sidebar open on md+ viewports, closed below — follows breakpoint changes.
 * Manual toggles persist until the next breakpoint crossing.
 */
export function useResponsiveSidebarOpen(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(SIDEBAR_DESKTOP_MIN_MEDIA)
    const sync = (): void => setSidebarOpen(mq.matches)

    sync()
    mq.addEventListener('change', sync)

    return () => mq.removeEventListener('change', sync)
  }, [])

  return [sidebarOpen, setSidebarOpen]
}
