/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { useErrorModal } from '@/hooks'
import { apiClient } from '@/lib/axios'
import { Location } from '@/types'

interface LocationCardProps extends Location {
  onUpdated?: () => void;
}

export function LocationCard({ onUpdated, ...location } : LocationCardProps) {
  const router = useRouter()
  const { openModal } = useErrorModal()
  const [actionsOpen, setActionsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const [name, setName] = useState(location.name)
  const pressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startPress = () => {
    setLongPressTriggered(false)
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current)
    }
    pressTimeout.current = setTimeout(() => {
      setActionsOpen(true)
      setLongPressTriggered(true)
    }, 500)
  }

  const cancelPress = () => {
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current)
      pressTimeout.current = null
    }
  }

  const handleClick = () => {
    if (longPressTriggered) {
      return
    }
    router.push(`/location/${location.id}`)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this location?')
    if (!confirmed) {
      return
    }

    try {
      await apiClient.delete(`/location/${location.id}`)
      setActionsOpen(false)
      if (onUpdated) {
        onUpdated()
      }
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to delete location')
    }
  }

  const handleSave = async () => {
    try {
      await apiClient.patch(`/location/${location.id}`, { name })
      setEditOpen(false)
      if (onUpdated) {
        onUpdated()
      }
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to update location')
    }
  }

  return (
    <>
      <Item
        variant="outline"
        className='border-slate-400/50 rounded-md bg-linear-to-r from-gray-50 to-stone-100/75 '
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onClick={handleClick}
      >
        <ItemMedia>
          <Building2 className='text-slate-400 h-8 w-8'/>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className='text-xl  font-bold bg-linear-to-b from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text flex w-full justify-center pr-6'>
            {location.name}
          </ItemTitle>
        </ItemContent>
      </Item>

      <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Options</DialogTitle>
          </DialogHeader>
          <div className="flex gap-3">
            <Button type="button" onClick={() => {
              setActionsOpen(false); setEditOpen(true)
            }}>
              Edit
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Name</div>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
