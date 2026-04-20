'use client'

import { useState } from 'react'
import Image from 'next/image'

import { useErrorDialog } from '@/hooks/ui/use-error-dialog'
import { useCamera } from '@/hooks/useCamera'

const BADGE_CANVAS_WIDTH = 900
const BADGE_CANVAS_HEIGHT = 560

function formatBadgeDate(date: Date) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function buildDownloadFileName(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `badge-${year}${month}${day}-${hours}${minutes}.png`
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Impossibile caricare la foto acquisita.'))
    image.src = source
  })
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number
) {
  const sourceAspectRatio = image.width / image.height
  const targetAspectRatio = targetWidth / targetHeight

  let sourceX = 0
  let sourceY = 0
  let sourceWidth = image.width
  let sourceHeight = image.height

  if (sourceAspectRatio > targetAspectRatio) {
    sourceWidth = image.height * targetAspectRatio
    sourceX = (image.width - sourceWidth) / 2
  } else {
    sourceHeight = image.width / targetAspectRatio
    sourceY = (image.height - sourceHeight) / 2
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    targetX,
    targetY,
    targetWidth,
    targetHeight
  )
}

async function createBadgeDataUrl(photoDataUrl: string, capturedAt: Date) {
  const canvas = document.createElement('canvas')
  canvas.width = BADGE_CANVAS_WIDTH
  canvas.height = BADGE_CANVAS_HEIGHT

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Impossibile generare il badge.')
  }

  const photo = await loadImage(photoDataUrl)

  context.fillStyle = '#e2e8f0'
  context.fillRect(0, 0, BADGE_CANVAS_WIDTH, BADGE_CANVAS_HEIGHT)

  const cardX = 40
  const cardY = 40
  const cardWidth = BADGE_CANVAS_WIDTH - 80
  const cardHeight = BADGE_CANVAS_HEIGHT - 80

  context.save()
  context.shadowColor = 'rgba(15, 23, 42, 0.16)'
  context.shadowBlur = 30
  context.shadowOffsetY = 12
  context.fillStyle = '#ffffff'
  drawRoundedRect(context, cardX, cardY, cardWidth, cardHeight, 28)
  context.fill()
  context.restore()

  context.save()
  drawRoundedRect(context, cardX, cardY, cardWidth, cardHeight, 28)
  context.clip()
  context.fillStyle = '#0f172a'
  context.fillRect(cardX, cardY, cardWidth, 126)
  context.fillStyle = '#16a34a'
  context.fillRect(cardX, cardY + 96, cardWidth, 30)
  context.restore()

  context.fillStyle = '#f8fafc'
  context.font = '700 48px sans-serif'
  context.fillText('VISITOR BADGE', cardX + 42, cardY + 68)

  context.fillStyle = '#cbd5e1'
  context.font = '500 20px sans-serif'
  context.fillText('Generated locally and ready for download', cardX + 42, cardY + 108)

  const photoX = cardX + 42
  const photoY = cardY + 160
  const photoWidth = 270
  const photoHeight = 280

  context.fillStyle = '#e2e8f0'
  drawRoundedRect(context, photoX, photoY, photoWidth, photoHeight, 24)
  context.fill()

  context.save()
  drawRoundedRect(context, photoX, photoY, photoWidth, photoHeight, 24)
  context.clip()
  drawImageCover(context, photo, photoX, photoY, photoWidth, photoHeight)
  context.restore()

  context.lineWidth = 4
  context.strokeStyle = '#cbd5e1'
  drawRoundedRect(context, photoX, photoY, photoWidth, photoHeight, 24)
  context.stroke()

  const contentX = photoX + photoWidth + 48

  context.fillStyle = '#0f172a'
  context.font = '700 34px sans-serif'
  context.fillText('Capture complete', contentX, photoY + 42)

  context.fillStyle = '#475569'
  context.font = '500 24px sans-serif'
  context.fillText('Status', contentX, photoY + 106)

  context.fillStyle = '#16a34a'
  context.font = '700 28px sans-serif'
  context.fillText('Ready to print', contentX, photoY + 144)

  context.fillStyle = '#475569'
  context.font = '500 24px sans-serif'
  context.fillText('Captured on', contentX, photoY + 214)

  context.fillStyle = '#0f172a'
  context.font = '600 28px sans-serif'
  context.fillText(formatBadgeDate(capturedAt), contentX, photoY + 252)

  context.fillStyle = '#475569'
  context.font = '500 24px sans-serif'
  context.fillText('Workflow', contentX, photoY + 322)

  context.fillStyle = '#0f172a'
  context.font = '600 26px sans-serif'
  context.fillText('Photo capture + badge download only', contentX, photoY + 360)

  context.fillStyle = '#94a3b8'
  context.font = '500 20px sans-serif'
  context.fillText('This file no longer manages appointments or check-in status.', contentX, photoY + 414)

  return canvas.toDataURL('image/png')
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function BadgeCreation() {
  const [capturedAt, setCapturedAt] = useState<Date | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const { reportError } = useErrorDialog()
  const {
    isCameraActive,
    capturedImageUrl,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto
  } = useCamera()

  const statusMessage = capturedImageUrl
    ? 'Foto acquisita. Ora puoi scaricare il badge oppure scattare di nuovo.'
    : isCameraActive
      ? 'Inquadra il volto e premi "Scatta foto".'
      : 'Attiva la fotocamera per iniziare la cattura del badge.'

  async function handleStartCamera() {
    setCapturedAt(null)
    await startCamera()
  }

  function handleCapturePhoto() {
    capturePhoto()
    setCapturedAt(new Date())
    stopCamera()
  }

  async function handleDownloadBadge() {
    if (!capturedImageUrl) {
      reportError('Scatta una foto prima di scaricare il badge.', {
        severity: 'warning',
        source: 'badge-creation/download',
        title: 'Foto non disponibile'
      })

      return
    }

    const badgeTimestamp = capturedAt ?? new Date()

    setIsDownloading(true)
    try {
      const badgeDataUrl = await createBadgeDataUrl(capturedImageUrl, badgeTimestamp)
      downloadDataUrl(badgeDataUrl, buildDownloadFileName(badgeTimestamp))
    } catch (error) {
      reportError(error, {
        source: 'badge-creation/download',
        title: 'Impossibile scaricare il badge'
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-5xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                Badge Capture
              </p>
              <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">
                Scatta la foto e scarica il badge
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Questa schermata gestisce solo la cattura della foto e il download del badge finale.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950">
              {capturedImageUrl && !isCameraActive ? (
                <Image
                  src={capturedImageUrl}
                  alt="Foto acquisita per il badge"
                  width={960}
                  height={720}
                  unoptimized
                  className="aspect-4/3 w-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  className="aspect-4/3 w-full object-cover"
                  playsInline
                  muted
                />
              )}

              {!capturedImageUrl && !isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 px-6 text-center text-sm text-slate-300">
                  Attiva la fotocamera per vedere l&apos;anteprima live.
                </div>
              )}
            </div>

            <p
              aria-live="polite"
              className="rounded-4xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
            >
              {statusMessage}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-11 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                onClick={() => void handleStartCamera()}
              >
                {capturedImageUrl ? 'Scatta di nuovo' : 'Attiva fotocamera'}
              </button>

              <button
                type="button"
                disabled={!isCameraActive}
                className="min-h-11 rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                onClick={handleCapturePhoto}
              >
                Scatta foto
              </button>

              <button
                type="button"
                disabled={!capturedImageUrl || isDownloading}
                className="min-h-11 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                onClick={() => void handleDownloadBadge()}
              >
                {isDownloading ? 'Preparazione badge...' : 'Scarica badge'}
              </button>

              {isCameraActive && (
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={stopCamera}
                >
                  Ferma fotocamera
                </button>
              )}
            </div>
          </section>

          <aside className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Anteprima Badge
            </p>

            <div className="mt-4 rounded-[24px] bg-slate-950 p-5 text-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Visitor Badge</p>
                  <p className="mt-2 text-2xl font-semibold">Ready for download</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {capturedImageUrl ? 'Ready' : 'Waiting'}
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-4xl bg-slate-800">
                {capturedImageUrl ? (
                  <Image
                    src={capturedImageUrl}
                    alt="Anteprima badge"
                    width={720}
                    height={900}
                    unoptimized
                    className="aspect-4/5 w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-4/5 items-center justify-center px-6 text-center text-sm text-slate-400">
                    La foto apparira qui dopo lo scatto.
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-4xl bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <span>Stato</span>
                  <span className="font-medium text-white">
                    {capturedImageUrl ? 'Pronto per il download' : 'In attesa della foto'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Data badge</span>
                  <span className="font-medium text-white">
                    {capturedAt ? formatBadgeDate(capturedAt) : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Workflow</span>
                  <span className="font-medium text-white">Solo foto + download</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
