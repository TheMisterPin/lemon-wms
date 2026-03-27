/* eslint-disable @typescript-eslint/no-explicit-any */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  url?: string;
  userAgent?: string;
}

class ClientLogger {
  private async sendLog(entry: LogEntry) {
    try {
      // Send to server endpoint
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      // Fail silently to avoid recursive errors
      console.warn('Failed to send log to server:', error)
    }
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    data?: any,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }
  }

  info(message: string, data?: any) {
    console.log(`[CLIENT LOG] ${message}`, data)
    this.sendLog(this.createLogEntry('info', message, data))
  }

  warn(message: string, data?: any) {
    console.warn(`[CLIENT LOG] ${message}`, data)
    this.sendLog(this.createLogEntry('warn', message, data))
  }

  error(message: string, data?: any) {
    console.error(`[CLIENT LOG] ${message}`, data)
    this.sendLog(this.createLogEntry('error', message, data))
  }

  debug(message: string, data?: any) {
    console.debug(`[CLIENT LOG] ${message}`, data)
    this.sendLog(this.createLogEntry('debug', message, data))
  }
}

export const logger = new ClientLogger()
