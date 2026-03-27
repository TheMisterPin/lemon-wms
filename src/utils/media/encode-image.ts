interface EncodeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxBytes?: number
}

export async function encodeImageFile(
  file: File,
  options: EncodeImageOptions = {},
): Promise<string> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    maxBytes = 900000,
  } = options

  const sourceUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = sourceUrl
  })

  const scale = Math.min(
    1,
    maxWidth / image.width || 1,
    maxHeight / image.height || 1,
  )

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(image.width * scale))
  canvas.height = Math.max(1, Math.floor(image.height * scale))

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to prepare image')
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  const encoded = canvas.toDataURL('image/jpeg', quality)

  if (encoded.length > maxBytes) {
    throw new Error('Image too large. Please use a smaller photo.')
  }

  return encoded
}
