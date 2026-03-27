/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'

interface ConsoleRecallState {
  isConsoleVisible: boolean
  toggleConsole: () => void
  showConsole: () => void
  hideConsole: () => void
}

export function useConsoleRecall(): ConsoleRecallState {
  const [isConsoleVisible, setIsConsoleVisible] = useState(false)

  // Load initial state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('console-recall-visible')
    if (saved !== null) {
      setIsConsoleVisible(JSON.parse(saved))
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('console-recall-visible', JSON.stringify(isConsoleVisible))
  }, [isConsoleVisible])

  const toggleConsole = useCallback(() => {
    setIsConsoleVisible((prev) => !prev)
  }, [])

  const showConsole = useCallback(() => {
    setIsConsoleVisible(true)
  }, [])

  const hideConsole = useCallback(() => {
    setIsConsoleVisible(false)
  }, [])

  // Add console recall functionality when visible
  useEffect(() => {
    if (isConsoleVisible) {
      // Create a floating console overlay
      const consoleOverlay = document.createElement('div')
      consoleOverlay.id = 'console-recall-overlay'
      consoleOverlay.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        height: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        padding: 10px;
        border-radius: 8px;
        z-index: 9999;
        overflow-y: auto;
        border: 1px solid #333;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      `

      const header = document.createElement('div')
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #333;
      `
      header.innerHTML = `
        <span style="color: #00ff00; font-weight: bold;">Console Recall</span>
        <button id="close-console" style="background: none; border: none; color: #ff0000; cursor: pointer; font-size: 16px;">×</button>
      `

      const logContainer = document.createElement('div')
      logContainer.id = 'console-log-container'
      logContainer.style.cssText = `
        height: 250px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-word;
      `

      consoleOverlay.appendChild(header)
      consoleOverlay.appendChild(logContainer)
      document.body.appendChild(consoleOverlay)

      // Load existing logs from localStorage
      const existingLogs = JSON.parse(localStorage.getItem('console-logs') || '[]')
      logContainer.innerHTML = existingLogs
        .slice(-50) // Show last 50 logs
        .map(
          (log: any) =>
            `<div style="margin-bottom: 2px; color: ${getLogColor(log.type)};">[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}</div>`,
        )
        .join('')

      // Auto-scroll to bottom
      logContainer.scrollTop = logContainer.scrollHeight

      // Close button functionality
      const closeButton = document.getElementById('close-console')
      if (closeButton) {
        closeButton.onclick = () => {
          setIsConsoleVisible(false)
        }
      }

      // Cleanup function
      return () => {
        const overlay = document.getElementById('console-recall-overlay')
        if (overlay) {
          document.body.removeChild(overlay)
        }
      }
    }
  }, [isConsoleVisible])

  return {
    isConsoleVisible,
    toggleConsole,
    showConsole,
    hideConsole,
  }
}

function getLogColor(type: string): string {
  switch (type) {
  case 'error':
    return '#ff4444'
  case 'warn':
    return '#ffaa00'
  case 'info':
    return '#4488ff'
  default:
    return '#00ff00'
  }
}
