'use client'

import * as React from 'react'
import type { LucideIcon } from 'lucide-react'

import { useTheme } from '@/components/shared/use-theme'
import { cn } from '@/lib/utils'

type CategoryIconProps = {
  /** Raster icon URL (Icons8-style: dark-on-transparent or dark-on-white). */
  src: string
  alt?: string
  className?: string
  /** Display size (CSS px); bitmap keeps source resolution and scales via CSS */
  size?: number
  /** Invoked when the image fails to load, decode, or maps to an empty glyph */
  onRasterDecodeError?: () => void
}

const TRANSPARENT_PIXEL_RATIO_THRESHOLD = 0.03
const WEIGHTED_LUM_THRESHOLD = 135

/**
 * Rewrites pixels to monochrome foreground + transparency for dashboard UI.
 * @param foregroundRgb — `255` for white glyphs (dark theme), `0` for black glyphs (light theme)
 */
function remapRasterIconForUi(imageData: ImageData, foregroundRgb: 255 | 0): boolean {
  const data = imageData.data
  const len = data.length
  const totalPixels = len / 4

  let transparentishPixels = 0
  for (let i = 3; i < len; i += 4) {
    if (data[i] < 250) {
      transparentishPixels++
    }
  }

  const useTransparencyAware = transparentishPixels / totalPixels > TRANSPARENT_PIXEL_RATIO_THRESHOLD

  let lightForeground = false
  if (useTransparencyAware) {
    let sumLumWeighted = 0
    let sumAlpha = 0
    for (let i = 0; i < len; i += 4) {
      const a = data[i + 3]
      if (a < 16) {
        continue
      }

      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const lum = r * 0.299 + g * 0.587 + b * 0.114
      sumLumWeighted += lum * a
      sumAlpha += a
    }

    const meanLum = sumAlpha > 0 ? sumLumWeighted / sumAlpha : 128
    lightForeground = meanLum > WEIGHTED_LUM_THRESHOLD
  }

  let maxOutAlpha = 0
  for (let i = 0; i < len; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const srcA = data[i + 3]
    const lum = r * 0.299 + g * 0.587 + b * 0.114

    let ink: number
    if (!useTransparencyAware) {
      ink = 255 - lum
    } else if (lightForeground) {
      ink = lum
    } else {
      ink = 255 - lum
    }

    ink = Math.max(0, Math.min(255, Math.round(ink)))
    const alphaOut = Math.round((ink * srcA) / 255)
    maxOutAlpha = Math.max(maxOutAlpha, alphaOut)

    data[i] = foregroundRgb
    data[i + 1] = foregroundRgb
    data[i + 2] = foregroundRgb
    data[i + 3] = alphaOut
  }

  return maxOutAlpha >= 8
}

/**
 * Loads a raster icon and redraws it as monochrome glyphs on a transparent background
 * (white on dark theme, black on light theme).
 */
export function CategoryIcon({
  src,
  alt = '',
  className,
  size = 24,
  onRasterDecodeError
}: CategoryIconProps): React.ReactElement | null {
  const { theme } = useTheme()
  const foregroundRgb: 255 | 0 = theme === 'dark' ? 255 : 0
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = React.useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const reportedErrorRef = React.useRef(false)
  const onRasterDecodeErrorRef = React.useRef(onRasterDecodeError)

  React.useEffect(() => {
    onRasterDecodeErrorRef.current = onRasterDecodeError
  }, [onRasterDecodeError])

  React.useEffect(() => {
    reportedErrorRef.current = false
  }, [src])

  React.useEffect(() => {
    if (!src) {
      setPhase('idle')

      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let cancelled = false
    setPhase('loading')

    const reportDecodeError = (): void => {
      if (reportedErrorRef.current) {
        return
      }

      reportedErrorRef.current = true
      onRasterDecodeErrorRef.current?.()
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'

    img.onload = () => {
      if (cancelled) {
        return
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        setPhase('error')
        reportDecodeError()

        return
      }

      const w = img.naturalWidth
      const h = img.naturalHeight

      if (w === 0 || h === 0) {
        setPhase('error')
        reportDecodeError()

        return
      }

      canvas.width = w
      canvas.height = h
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0)

      let imageData: ImageData

      try {
        imageData = ctx.getImageData(0, 0, w, h)
      } catch {
        setPhase('error')
        reportDecodeError()

        return
      }

      const okGlyph = remapRasterIconForUi(imageData, foregroundRgb)
      if (!okGlyph) {
        setPhase('error')
        reportDecodeError()

        return
      }

      ctx.putImageData(imageData, 0, 0)
      setPhase('ready')
    }

    img.onerror = () => {
      if (!cancelled) {
        setPhase('error')
        reportDecodeError()
      }
    }

    img.src = src

    return () => {
      cancelled = true
    }
  }, [src, foregroundRgb])

  return (
    <canvas
      ref={canvasRef}
      width={1}
      height={1}
      role="img"
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn(
        'inline-block shrink-0 align-middle',
        phase !== 'ready' && 'opacity-0',
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}

type CategoryPickerIconProps = {
  iconUrl: string | null | undefined
  fallback: LucideIcon
  size?: number
  className?: string
  /** Applied to the Lucide fallback when `iconUrl` is empty */
  fallbackClassName?: string
}

/**
 * Raster category icon when `iconUrl` is set; otherwise a Lucide glyph at a matching visual size.
 */
export function CategoryPickerIcon({
  iconUrl,
  fallback: Fallback,
  size = 20,
  className,
  fallbackClassName
}: CategoryPickerIconProps): React.ReactElement {
  const trimmed = iconUrl?.trim() ?? ''
  const [useRasterFallback, setUseRasterFallback] = React.useState(false)

  React.useEffect(() => {
    setUseRasterFallback(false)
  }, [trimmed])

  if (trimmed !== '' && !useRasterFallback) {
    return (
      <CategoryIcon
        src={trimmed}
        size={size}
        className={cn('shrink-0', className)}
        alt=""
        onRasterDecodeError={() => setUseRasterFallback(true)}
      />
    )
  }

  const side = Math.max(14, Math.round(size * 0.85))

  return (
    <Fallback
      className={cn('shrink-0 opacity-90', fallbackClassName)}
      aria-hidden
      style={{ width: side, height: side }}
    />
  )
}
