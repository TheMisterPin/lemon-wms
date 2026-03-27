/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-console */
'use client'

import { useEffect, useState } from 'react'

export interface LogEntry {
  id: string
  timestamp: string
  type: 'log' | 'error' | 'warn' | 'info'
  message: string
  stack?: string
}

const STORAGE_KEY = 'console-logs'
const MAX_LOGS = 1000

export function useConsoleLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    // Load existing logs from localStorage
    const savedLogs = localStorage.getItem(STORAGE_KEY)
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs))
      } catch (e) {
        console.error('Failed to parse saved logs:', e)
      }
    }

    // Store original console methods
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    }

    const addLogEntry = (type: LogEntry['type'], args: any[]) => {
      const entry: LogEntry = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type,
        message: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' '),
      }

      // Use setTimeout to defer state update and avoid updating during render
      setTimeout(() => {
        setLogs((prevLogs) => {
          const newLogs = [entry, ...prevLogs].slice(0, MAX_LOGS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs))
          return newLogs
        })
      }, 0)
    }

    // Override console methods
    console.log = (...args) => {
      originalConsole.log(...args)
      addLogEntry('log', args)
    }

    console.error = (...args) => {
      originalConsole.error(...args)
      addLogEntry('error', args)
    }

    console.warn = (...args) => {
      originalConsole.warn(...args)
      addLogEntry('warn', args)
    }

    console.info = (...args) => {
      originalConsole.info(...args)
      addLogEntry('info', args)
    }

    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      const entry: LogEntry = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
      }

      setTimeout(() => {
        setLogs((prevLogs) => {
          const newLogs = [entry, ...prevLogs].slice(0, MAX_LOGS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs))
          return newLogs
        })
      }, 0)
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const entry: LogEntry = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
      }

      setTimeout(() => {
        setLogs((prevLogs) => {
          const newLogs = [entry, ...prevLogs].slice(0, MAX_LOGS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs))
          return newLogs
        })
      }, 0)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup function
    return () => {
      console.log = originalConsole.log
      console.error = originalConsole.error
      console.warn = originalConsole.warn
      console.info = originalConsole.info
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const clearLogs = () => {
    setLogs([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `console-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return { logs, clearLogs, exportLogs }
}
