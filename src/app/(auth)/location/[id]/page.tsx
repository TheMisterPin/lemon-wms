/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ChevronLeft, PlusCircle } from 'lucide-react'

import { BoxCard } from '@/_components/cards/box-card'
import { CreateBoxForm } from '@/_components/forms/create-box-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useErrorModal } from '@/hooks'
import { apiClient } from '@/lib/axios'
import { Box, Location } from '@/types'
import { logger } from '@/utils/logger/client-logger'

export default function LocationBoxesPage() {
  const params = useParams<{ id: string }>()
  const locationId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [boxes, setBoxes] = useState<Box[]>([])
  const [locationName, setLocationName] = useState('Location')
  const [fetchingBoxes, setFetchingBoxes] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { openModal } = useErrorModal()

  useEffect(() => {
    if (locationId) {
      fetchBoxes()
      fetchLocationName()
    } else {
      setFetchingBoxes(false)
    }
  }, [locationId])

  const fetchLocationName = async () => {
    if (!locationId) {
      return
    }

    try {
      const locations = await apiClient.get<Location[]>('/location')
      const match = locations.find((location) => location.id === locationId)
      setLocationName(match?.name ?? 'Location')
    } catch (error: any) {
      logger.error('Failed to fetch location name', {
        error: error?.message,
        status: error?.response?.status,
        responseData: error?.response?.data,
      })
    }
  }

  const fetchBoxes = async () => {
    if (!locationId) {
      return
    }

    setFetchingBoxes(true)
    try {
      // Debug: Check if token exists
      const token = localStorage.getItem('authToken')
      console.log('Token exists:', !!token)
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null')

      logger.info('Fetching boxes', {
        tokenExists: !!token,
        pathname: window.location.pathname,
        locationId,
      })

      const data = await apiClient.get<Box[]>('/box', { locationId })
      setBoxes(data)
      logger.info('Boxes fetched successfully', { count: data.length })
    } catch (error : any) {
      console.error('Failed to fetch boxes:', error)
      console.error('Error response:', error?.response)
      logger.error('Failed to fetch boxes', {
        error: error?.message,
        status: error?.response?.status,
        responseData: error?.response?.data,
      })
      openModal(error?.response?.data?.error ?? 'Failed to fetch boxes')
    } finally {
      setFetchingBoxes(false)
    }
  }

  const handleBoxCreated = () => {
    setDialogOpen(false)
    fetchBoxes()
  }

  if (fetchingBoxes) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div>Loading...</div>
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
                href="/locations"
                className="rounded-md p-1 text-stone-600 transition-colors hover:bg-slate-200/60"
                aria-label="Back to locations"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold bg-linear-to-t from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text">
                {locationName}
              </h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <PlusCircle className=" h-6 w-6 text-stone-600" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Box</DialogTitle>
                </DialogHeader>
                {locationId && (
                  <CreateBoxForm onSuccess={handleBoxCreated} locationId={locationId} />
                )}
              </DialogContent>
            </Dialog>
          </div>
          <Separator className="bg-linear-to-b from-stone-800/75 to-slate-700/75" />
          <div className="flex flex-col gap-4   pt-4">
            {boxes.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                No boxes yet. Create your first box to get started.
              </p>
            ) : (
              boxes.map((box) => (
                <BoxCard key={box.id} onUpdated={fetchBoxes} box={box} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
