/* eslint-disable @typescript-eslint/no-explicit-any */
import { encodeImageFile } from './encode-image'

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY

if (!IMGBB_API_KEY) {
  console.warn('IMGBB API key is not set. Set NEXT_PUBLIC_IMGBB_API_KEY or IMGBB_API_KEY.')
}

export async function uploadToImgbb(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error('IMGBB API key not configured')
  }

  // Encode and strip the data URL prefix so we only send base64 payload.
  const dataUrl = await encodeImageFile(file)
  const base64 = dataUrl.split(',')[1] ?? dataUrl

  const formData = new FormData()
  formData.append('image', base64)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || 'Failed to upload image')
  }

  const json = (await response.json()) as any
  const url = json?.data?.url || json?.data?.display_url || json?.data?.image?.url
  if (!url) {
    throw new Error('Upload succeeded but no URL returned')
  }
  return url as string
}
