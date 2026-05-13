'use client'

import { Skeleton } from '@/components/ui/skeleton'

/** Mirrors full warehouse create / edit field grid (2 cols + wide rows). */
export function ManageLocationsWarehouseFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
  )
}

/** Mirrors create zone inline panel (title block + 2-col form). */
export function ManageLocationsZoneCreateFormSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/40 p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="h-10 w-28" />
    </div>
  )
}

/** Mirrors create bin inline panel. */
export function ManageLocationsBinCreateFormSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/40 p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full max-w-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

/** Zone editor: name + type + status card + save + collapsible block. */
export function ManageLocationsZoneEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <div className="space-y-3 rounded-lg border p-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <Skeleton className="h-10 w-44" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}

/** Bin editor fields. */
export function ManageLocationsBinEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-52" />
      </div>
    </div>
  )
}
