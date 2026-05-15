import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
/**
 * cn.
 * @param inputs - Parameter for cn.
 * @returns Result from cn.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Matches Tailwind `md` — used by shell sidebars. */
export const SIDEBAR_DESKTOP_MIN_MEDIA = '(min-width: 768px)'

/**
 * Collapses the layout sidebar after navigation on small viewports only.
 * Desktop keeps the sidebar open when following in-sidebar links.
 */
export function closeSidebarIfMobile(onClose?: () => void): void {
  if (!onClose || typeof window === 'undefined') {
    return
  }
  if (window.matchMedia(SIDEBAR_DESKTOP_MIN_MEDIA).matches) {
    return
  }
  onClose()
}
