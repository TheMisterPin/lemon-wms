/**
 * Generate and download a QR code PDF for a box.
 * The QR encodes the full box URL so scanning opens the box page directly.
 */
export async function downloadBoxQrPdf(boxId: string, baseUrl?: string): Promise<void> {
  if (!boxId) {
    throw new Error('Box id is required')
  }

  const origin = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const boxUrl = `${origin}/box/${boxId}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(boxUrl)}`

  const response = await fetch(qrUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch QR image')
  }

  const imageBytes = await response.arrayBuffer()

  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([420, 540])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pngImage = await pdfDoc.embedPng(imageBytes)
  const targetWidth = 300
  const scale = targetWidth / pngImage.width
  const imgWidth = targetWidth
  const imgHeight = pngImage.height * scale

  const x = (page.getWidth() - imgWidth) / 2
  const y = (page.getHeight() - imgHeight) / 2

  page.drawText('Scan to view box', {
    x: 40,
    y: page.getHeight() - 50,
    size: 16,
    font,
    color: rgb(0.12, 0.12, 0.12),
  })

  page.drawImage(pngImage, {
    x,
    y,
    width: imgWidth,
    height: imgHeight,
  })

  page.drawText(boxUrl, {
    x: 40,
    y: 40,
    size: 10,
    font,
    color: rgb(0.25, 0.25, 0.25),
  })

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `box-${boxId}-qr.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
