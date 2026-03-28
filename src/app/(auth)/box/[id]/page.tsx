/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, QrCode } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useErrorModal } from '@/hooks'
import { apiClient } from '@/lib/axios'
import { Box } from '@/types'
import { logger } from '@/utils/components/logger/client-logger'
import { downloadBoxQrPdf } from '@/utils/label/qr'
export default function BoxDetailPage() {
  const params = useParams<{ id: string }>()
  const boxId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [box, setBox] = useState<Box | null>(null)
  const [fetchingBox, setFetchingBox] = useState(true)
  const { openModal } = useErrorModal()
  useEffect(() => {
    if (boxId) {
      fetchBox()
    } else {
      setFetchingBox(false)
    }
  }, [boxId])
  const fetchBox = async () => {
    if (!boxId) {
      return
    }
    setFetchingBox(true)
    try {
      const data = await apiClient.get<Box>(`/box/${boxId}`)
      setBox(data)
    } catch (error: any) {
      logger.error('Failed to fetch box', {
        error: error?.message,
        status: error?.response?.status,
        responseData: error?.response?.data
      })
      openModal(error?.response?.data?.error ?? 'Failed to fetch box')
    } finally {
      setFetchingBox(false)
    }
  }
  const handleDownloadQr = async () => {
    if (!boxId) {
      return
    }
    try {
      await downloadBoxQrPdf(boxId)
    } catch (error: any) {
      logger.error('Failed to generate QR PDF', {
        error: error?.message
      })
      openModal('Failed to generate QR')
    }
  }
  if (fetchingBox) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div>
Loading...
        </div>
      </div>
    )
  }
  if (!box) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div>
Box not found.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="container h-full p-4 border-2  border-slate-400/50 rounded-md justify-around ">
          <div className="mb-6 flex  gap-4 items-center justify-between px-10">
            <div className="flex items-center gap-3">
              <Link
                href="/box"
                className="rounded-md p-1 text-stone-600 transition-colors hover:bg-slate-200/60"
                aria-label="Back to boxes"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold bg-linear-to-t from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text">
                {box.name}
              </h1>
            </div>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="rounded-md p-1 text-stone-600 transition-colors hover:bg-slate-200/60"
              aria-label="Download QR"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>
          <Separator className="bg-linear-to-b from-stone-800/75 to-slate-700/75" />
          <div className="flex flex-col gap-4 pt-4">
            <div className="rounded-md border border-slate-400/50 bg-linear-to-r from-gray-50 to-stone-100/75 p-4">
              <div className="text-sm font-medium text-slate-700">
Closed Box
              </div>
              {box.closedImage ? (
                <a
                  href={box.closedImage}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-2"
                >
                  <img
                    src={box.closedImage}
                    alt="Closed box"
                    className="w-full max-h-96 rounded-md object-cover border border-slate-200"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">
No photo yet.
                </div>
              )}
            </div>
            <div className="rounded-md border border-slate-400/50 bg-linear-to-r from-gray-50 to-stone-100/75 p-4">
              <div className="text-sm font-medium text-slate-700">
Contents
              </div>
              {box.contentsImage ? (
                <a
                  href={box.contentsImage}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-2"
                >
                  <img
                    src={box.contentsImage}
                    alt="Box contents"
                    className="w-full max-h-96 rounded-md object-cover border border-slate-200"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">
No photo yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
