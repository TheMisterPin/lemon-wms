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
