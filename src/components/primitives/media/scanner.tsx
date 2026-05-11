/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/media/scanner.md
 */

/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import * as React from 'react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { BrowserMultiFormatReader, NotFoundException, Result, Exception } from '@zxing/library'
import { ScanBarcode, X, Camera, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface BarcodeScannerProps {
  onScan?: (value: string) => void
  className?: string
}

export function BarcodeScanner({ onScan, className }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scannedValue, setScannedValue] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  // Stop scanning
  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset()
      readerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])
  // Get available cameras
  const getDevices = useCallback(async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ video: true })
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)

      // Prefer back camera on mobile
      const backCamera = videoDevices.find(
        device => device.label.toLowerCase().includes('back') ||
                  device.label.toLowerCase().includes('rear') ||
                  device.label.toLowerCase().includes('environment')
      )
      setSelectedDeviceId(backCamera?.deviceId || videoDevices[0]?.deviceId || null)
    } catch (err) {
      console.error('Error getting devices:', err)
      setError('Camera access denied. Please allow camera permissions.')
    }
  }, [])

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!videoRef.current || !selectedDeviceId) {
      return
    }

    setIsScanning(true)
    setError(null)
    setScannedValue(null)

    try {
      readerRef.current = new BrowserMultiFormatReader()

      await readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result: Result | null, err: Exception | undefined) => {
          if (result) {
            const text = result.getText()
            setScannedValue(text)
            setIsScanning(false)
            onScan?.(text)
            stopScanning()
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('Scan error:', err)
          }
        }
      )

      // Store stream reference for cleanup
      if (videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject as MediaStream
      }
    } catch (err) {
      console.error('Error starting scanner:', err)
      setError('Failed to start camera. Please try again.')
      setIsScanning(false)
    }
  }, [selectedDeviceId, onScan])

  // Handle dropdown open/close
  useEffect(() => {
    if (isOpen) {
      getDevices()
    } else {
      stopScanning()
      setScannedValue(null)
      setError(null)
    }
  }, [isOpen, getDevices, stopScanning])

  // Start scanning when device is selected and dropdown is open
  useEffect(() => {
    if (isOpen && selectedDeviceId && !scannedValue) {
      const timer = setTimeout(() => {
        startScanning()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isOpen, selectedDeviceId, startScanning, scannedValue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  // Switch camera
  const switchCamera = () => {
    if (devices.length <= 1) {
      return
    }
    stopScanning()
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % devices.length
    setSelectedDeviceId(devices[nextIndex].deviceId)
    setScannedValue(null)
  }

  // Reset and scan again
  const resetScan = () => {
    setScannedValue(null)
    setError(null)
    startScanning()
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2">
            <ScanBarcode className="size-5" />
            Scan Barcode / QR
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 p-0"
          align="center"
          sideOffset={8}
        >
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">
                {scannedValue ? 'Scanned!' : 'Point at a barcode or QR code'}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Camera View */}
            <div className="relative aspect-square w-full overflow-hidden bg-black">
              <video
                ref={videoRef}
                className={cn(
                  'h-full w-full object-cover',
                  scannedValue && 'opacity-50'
                )}
                playsInline
                muted
              />

              {/* Scanning overlay */}
              {isScanning && !scannedValue && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-48 w-48">
                    {/* Corner brackets */}
                    <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-primary" />
                    <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-primary" />
                    <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-primary" />
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-primary"
                      style={{ animation: 'scan 2s ease-in-out infinite' }} />
                  </div>
                </div>
              )}

              {/* Success overlay */}
              {scannedValue && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="rounded-full bg-green-500 p-3">
                    <ScanBarcode className="size-8 text-white" />
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="px-4 text-center">
                    <Camera className="mx-auto mb-2 size-8 text-muted-foreground" />
                    <p className="text-sm text-white">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with controls */}
            <div className="flex items-center justify-between border-t px-3 py-2">
              {devices.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={switchCamera}
                  disabled={!!scannedValue}
                >
                  <RefreshCw className="mr-1 size-4" />
                  Switch Camera
                </Button>
              )}
              {scannedValue && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetScan}
                  className="ml-auto"
                >
                  Scan Again
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Display scanned value */}
      {scannedValue && (
        <div className="w-full max-w-md rounded-lg border bg-card p-4 shadow-sm">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Scanned Value
          </p>
          <p className="break-all font-mono text-lg">{scannedValue}</p>
        </div>
      )}

      {/* Inline styles for scanning animation */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% {
            top: 0;
          }
          50% {
            top: calc(100% - 2px);
          }
        }
      `}</style>
    </div>
  )
}
