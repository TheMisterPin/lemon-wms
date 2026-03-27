/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useState } from 'react'

import { PlusCircle } from 'lucide-react'

import { LocationCard } from '@/_components/cards/location-card'
import { CreateLocationForm } from '@/_components/forms/create-location-form'
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
import { Location } from '@/types'
import { logger } from '@/utils/logger/client-logger'

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [fetchingLocations, setFetchingLocations] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { openModal } = useErrorModal()

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    setFetchingLocations(true)
    try {
      // Debug: Check if token exists
      const token = localStorage.getItem('authToken')
      console.log('Token exists:', !!token)
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null')

      logger.info('Fetching locations', {
        tokenExists: !!token,
        pathname: window.location.pathname,
      })

      const data = await apiClient.get<Location[]>('/location')
      setLocations(data)
      logger.info('Locations fetched successfully', { count: data.length })
    } catch (error : any) {
      console.error('Failed to fetch locations:', error)
      console.error('Error response:', error?.response)
      logger.error('Failed to fetch locations', {
        error: error?.message,
        status: error?.response?.status,
        responseData: error?.response?.data,
      })
      openModal(error?.response?.data?.error ?? 'Failed to fetch locations')
    } finally {
      setFetchingLocations(false)
    }
  }

  const handleLocationCreated = () => {
    setDialogOpen(false)
    fetchLocations()
  }

  if (fetchingLocations) {
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
            <h1 className="text-2xl font-bold bg-linear-to-t from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text">Locations</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <PlusCircle className=" h-6 w-6 text-stone-600" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Location</DialogTitle>
                </DialogHeader>
                <CreateLocationForm onSuccess={handleLocationCreated} />
              </DialogContent>
            </Dialog>
          </div>
          <Separator className="bg-linear-to-b from-stone-800/75 to-slate-700/75" />
          <div className="flex flex-col gap-4   pt-4">
            {locations.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                No locations yet. Create your first location to get started.
              </p>
            ) : (
              locations.map((location) => (
                <LocationCard key={location.id} onUpdated={fetchLocations} {...location} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
