'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/shared/use-camera.md
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { useErrorDialog } from '@/components/shared/use-error-dialog'

interface UseCameraResult {
  isCameraActive: boolean
  capturedImageUrl: string | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  startCamera: () => Promise<void>
  stopCamera: () => void
  capturePhoto: () => void
}

export function useCamera(): UseCameraResult {
  const { reportError } = useErrorDialog()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const attachIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
  }, [])

  const attachStreamToVideo = useCallback(async () => {
    const stream = streamRef.current
    const video = videoRef.current
    if (!stream || !video) {
      return false
    }

    video.srcObject = stream
    try {
      await video.play()
    } catch (err) {
      console.warn('Video playback failed', err)
    }

    return true
  }, [])

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reportError('La fotocamera non è supportata dal browser.', {
          severity: 'warning',
          source: 'camera/start',
          title: 'Fotocamera non disponibile'
        })

        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })
      streamRef.current = stream
      const attached = await attachStreamToVideo()
      if (!attached) {
        attachIntervalRef.current = window.setInterval(async () => {
          const didAttach = await attachStreamToVideo()
          if (didAttach && attachIntervalRef.current) {
            window.clearInterval(attachIntervalRef.current)
            attachIntervalRef.current = null
          }
        }, 50)
      }
      setIsCameraActive(true)
      setCapturedImageUrl(null)
    } catch (err) {
      console.error('Unable to start camera', err)
      reportError(err, {
        source: 'camera/start',
        title: 'Impossibile accedere alla fotocamera'
      })
    }
  }, [attachStreamToVideo, reportError])

  const stopCamera = useCallback(() => {
    if (attachIntervalRef.current) {
      window.clearInterval(attachIntervalRef.current)
      attachIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) {
      return
    }
    const video = videoRef.current
    const canvas = canvasRef.current

    const width = video.videoWidth || 640
    const height = video.videoHeight || 480

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    ctx.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/png')
    setCapturedImageUrl(dataUrl)
  }, [isCameraActive])

  useEffect(() => {
    return () => {
      if (attachIntervalRef.current) {
        window.clearInterval(attachIntervalRef.current)
        attachIntervalRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  return {
    isCameraActive,
    capturedImageUrl,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto
  }
}
