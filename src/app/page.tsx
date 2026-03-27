/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { BoxIcon, Building2, QrCode } from 'lucide-react'

import { LoginPage } from '@/_components/pages/login-page'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { useAuth } from '@/hooks'
import { stopStream } from '@/utils/camera'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [scanning, setScanning] = React.useState(false)
  const [scanError, setScanError] = React.useState('')
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const detectorRef = React.useRef<any>(null)
  const scanningRef = React.useRef(false)
  const codeReaderRef = React.useRef<any>(null)

  const navigateFromQr = React.useCallback(
    (raw: string) => {
      try {
        const maybeUrl = new URL(raw)
        if (maybeUrl.origin === window.location.origin) {
          router.push(maybeUrl.pathname + maybeUrl.search + maybeUrl.hash)
          return
        }
        window.location.href = raw
      } catch (_err) {
        router.push(`/box/${raw}`)
      }
    },
    [router],
  )

  const stopScanning = React.useCallback(() => {
    scanningRef.current = false
    setScanning(false)
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (_e) {
        // ignore
      }
      codeReaderRef.current = null
    }
    stopStream(streamRef.current)
    streamRef.current = null
  }, [])

  React.useEffect(() => () => stopScanning(), [stopScanning])

  const handleScanClick = React.useCallback(async () => {
    setScanError('')
    if (scanningRef.current) {
      stopScanning()
      return
    }

    // show the scanning panel immediately
    scanningRef.current = true
    setScanning(true)

    if (typeof window === 'undefined') {
      setScanError('Scanner unavailable')
      scanningRef.current = false
      setScanning(false)
      return
    }

    try {
      if ((window as any).BarcodeDetector) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        detectorRef.current = detector

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        const scanFrame = async () => {
          if (!scanningRef.current || !videoRef.current || !detectorRef.current) {
            return
          }
          try {
            const codes = await detectorRef.current.detect(videoRef.current)
            if (codes.length > 0) {
              const raw = codes[0].rawValue
              stopScanning()
              if (raw) {
                navigateFromQr(raw)
              }
              return
            }
          } catch (error) {
            setScanError('Failed to read QR')
          }
          if (scanningRef.current) {
            requestAnimationFrame(scanFrame)
          }
        }

        requestAnimationFrame(scanFrame)
        return
      }

      // Fallback: use @zxing/browser
      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const reader = new BrowserQRCodeReader()
      codeReaderRef.current = reader
      reader
        .decodeFromVideoDevice(undefined, videoRef.current!, (result, err, controls) => {
          if (!scanningRef.current) {
            controls?.stop()
            return
          }
          if (result) {
            scanningRef.current = false
            controls?.stop()
            stopScanning()
            navigateFromQr(result.getText())
          }
          if (err && err.name !== 'NotFoundException') {
            setScanError('Failed to read QR')
          }
        })
        .catch((error: any) => {
          setScanError(error?.message ?? 'Unable to start camera')
          stopScanning()
        })
    } catch (error: any) {
      setScanError(error?.message ?? 'Unable to start camera')
      stopScanning()
    }
  }, [navigateFromQr, stopScanning])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="container h-full p-4 border-2 border-slate-400/50 rounded-md justify-around">
          <div className="mb-6 flex gap-4 items-center justify-between px-10">
            <h1 className="text-2xl font-bold bg-linear-to-t from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text">
              Home
            </h1>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => void handleScanClick()}>
                <QrCode className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </div>
          </div>
          {scanning && (
            <div className="mb-4 rounded-md border border-slate-300 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-slate-700">Scan a QR to open a box</div>
                <Button size="sm" variant="ghost" onClick={() => void stopScanning()}>
                  Stop
                </Button>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-md border border-slate-200 bg-black/60">
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                <div className="pointer-events-none absolute inset-0 border-2 border-emerald-400/60 rounded" />
              </div>
              {scanError && <div className="mt-2 text-sm text-red-600">{scanError}</div>}
              {!scanError && <div className="mt-2 text-sm text-slate-600">Point the camera at a box QR</div>}
            </div>
          )}
          <div className="flex flex-col gap-4 pt-4">
            <Item
              asChild
              variant="outline"
              className="border-slate-400/50 rounded-md bg-linear-to-r from-gray-50 to-stone-100/75"
            >
              <Link href="/box" className="w-full">
                <ItemMedia>
                  <Building2 className="text-slate-400 h-8 w-8" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-xl font-bold bg-linear-to-b from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text flex w-full justify-center pr-6">
                    Locations
                  </ItemTitle>
                </ItemContent>
              </Link>
            </Item>
            <Item
              asChild
              variant="outline"
              className="border-slate-400/50 rounded-md bg-linear-to-r from-gray-50 to-stone-100/75"
            >
              <Link href="/locations" className="w-full">
                <ItemMedia>
                  <BoxIcon className="text-slate-400 h-8 w-8" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-xl font-bold bg-linear-to-b from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text flex w-full justify-center pr-6">
                    Boxes
                  </ItemTitle>
                </ItemContent>
              </Link>
            </Item>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-linear-to-r from-gray-200 to-slate-200 min-h-full w-full mx-auto">
      <LoginPage />
    </div>
  )
}
