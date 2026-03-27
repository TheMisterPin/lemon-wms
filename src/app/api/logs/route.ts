import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  url?: string;
  userAgent?: string;
}

export async function POST(req: NextRequest) {
  try {
    const logEntry: LogEntry = await req.json()

    // Create logs directory if it doesn't exist
    const logsDir = join(process.cwd(), 'logs')
    if (!existsSync(logsDir)) {
      await mkdir(logsDir, { recursive: true })
    }

    // Create log file name based on date
    const date = new Date().toISOString().split('T')[0]
    const logFile = join(logsDir, `client-${date}.json`)

    // Read existing logs or create new array
    let logs: LogEntry[] = []
    if (existsSync(logFile)) {
      try {
        const fileContent = await require('fs/promises').readFile(logFile, 'utf-8')
        logs = JSON.parse(fileContent)
      } catch {
        // If file is corrupted, start fresh
        logs = []
      }
    }

    // Add new log entry
    logs.push(logEntry)

    // Write back to file
    await writeFile(logFile, JSON.stringify(logs, null, 2), 'utf-8')

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Failed to write log:', error)
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 })
  }
}
