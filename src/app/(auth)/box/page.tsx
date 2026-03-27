/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useState } from 'react'

import { PlusCircle } from 'lucide-react'

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

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [fetchingBoxes, setFetchingBoxes] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { openModal } = useErrorModal()

  useEffect(() => {
    fetchBoxes()
    fetchLocations()
  }, [])

  const fetchBoxes = async () => {
    setFetchingBoxes(true)
    try {
      const token = localStorage.getItem('authToken')
      console.log('Token exists:', !!token)
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null')

      logger.info('Fetching boxes', {
        tokenExists: !!token,
        pathname: window.location.pathname,
      })

      const data = await apiClient.get<Box[]>('/box')
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

  const fetchLocations = async () => {
    try {
      const data = await apiClient.get<Location[]>('/location')
      setLocations(data)
    } catch (error: any) {
      logger.error('Failed to fetch locations', {
        error: error?.message,
        status: error?.response?.status,
        responseData: error?.response?.data,
      })
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
            <h1 className="text-2xl font-bold bg-linear-to-t from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text">Boxes</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <PlusCircle className=" h-6 w-6 text-stone-600" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Box</DialogTitle>
                </DialogHeader>
                <CreateBoxForm onSuccess={handleBoxCreated} locations={locations} />
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
