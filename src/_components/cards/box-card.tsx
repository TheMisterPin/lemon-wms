/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { BoxIcon } from 'lucide-react'

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
import { Box } from '@/types'
import { uploadToImgbb } from '@/utils/media/upload-imgbb'

interface BoxCardProps {
  box: Box;
  onUpdated?: () => void;
}

export function BoxCard(props : BoxCardProps) {
  const { box, onUpdated } = props
  const boxId = box?.id
  const router = useRouter()
  const { openModal } = useErrorModal()
  const [actionsOpen, setActionsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const pressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [name, setName] = useState(box?.name ?? '')
  const [description, setDescription] = useState(box?.description ?? '')
  const [closedImage, setClosedImage] = useState<string>(box?.closedImage ?? '')
  const [contentsImage, setContentsImage] = useState<string>(box?.contentsImage ?? '')
  const [uploadingClosed, setUploadingClosed] = useState(false)
  const [uploadingContents, setUploadingContents] = useState(false)

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
    if (!boxId) {
      openModal('Box id is missing')
      return
    }
    router.push(`/box/${boxId}`)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this box?')
    if (!confirmed) {
      return
    }

    if (!boxId) {
      openModal('Box id is missing')
      return
    }

    try {
      await apiClient.delete(`/box/${boxId}`)
      setActionsOpen(false)
      if (onUpdated) {
        onUpdated()
      }
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to delete box')
    }
  }

  const handleSave = async () => {
    if (!boxId) {
      openModal('Box id is missing')
      return
    }
    try {
      await apiClient.patch(`/box/${boxId}`, {
        name,
        description,
        closedImage,
        contentsImage,
      })
      setEditOpen(false)
      if (onUpdated) {
        onUpdated()
      }
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to update box')
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
          <BoxIcon className='text-slate-400 h-8 w-8'/>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className='text-xl  font-bold bg-linear-to-b from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text flex w-full  pr-6'>
            {box?.name ?? 'Box'}
          </ItemTitle>
          {box?.description && (
            <div className="text-sm text-muted-foreground">{box.description}</div>
          )}
        </ItemContent>
      </Item>

      <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Box Options</DialogTitle>
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
            <DialogTitle>Edit Box</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Name</div>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <div className="text-sm font-medium">Description</div>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div>
              <div className="text-sm font-medium">Closed Box Photo</div>
              <Input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) {
                    setClosedImage('')
                    return
                  }
                  try {
                    setUploadingClosed(true)
                    const url = await uploadToImgbb(file)
                    setClosedImage(url)
                  } catch (error: any) {
                    openModal(error?.message ?? 'Failed to upload image')
                    setClosedImage('')
                  } finally {
                    setUploadingClosed(false)
                  }
                }}
              />
              {uploadingClosed && (
                <div className="text-sm text-muted-foreground">Uploading closed-box photo...</div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium">Contents Photo</div>
              <Input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) {
                    setContentsImage('')
                    return
                  }
                  try {
                    setUploadingContents(true)
                    const url = await uploadToImgbb(file)
                    setContentsImage(url)
                  } catch (error: any) {
                    openModal(error?.message ?? 'Failed to upload image')
                    setContentsImage('')
                  } finally {
                    setUploadingContents(false)
                  }
                }}
              />
              {uploadingContents && (
                <div className="text-sm text-muted-foreground">Uploading contents photo...</div>
              )}
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
