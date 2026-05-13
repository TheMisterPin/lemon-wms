'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  MapPin,
  ShelvingUnit,
  Warehouse
} from 'lucide-react'

import CreateBinForm from '@/components/features/locations/bins/components/create-bin-form'
import { EditBinFormContent } from '@/components/features/locations/bins/components/edit-bin-modal'
import { LocationHierarchySelect } from '@/components/features/locations/shared/components/location-hierarchy-select'
import {
  ManageLocationsBinCreateFormSkeleton,
  ManageLocationsZoneCreateFormSkeleton
} from '@/components/features/locations/shared/components/manage-locations-modal-skeletons'
import { useManageLocationsCreates } from '@/components/features/locations/shared/hooks/use-manage-locations-creates'
import { useSelectLocationModalData } from '@/components/features/locations/shared/hooks/use-select-location-modal-data'
import CreateWarehouseForm from '@/components/features/locations/warehouses/components/create-warehouse-form'
import { EditWarehouseForm } from '@/components/features/locations/warehouses/components/edit-warehouse-form'
import CreateZoneForm from '@/components/features/locations/zones/components/create-zone-form'
import { EditZoneForm } from '@/components/features/locations/zones/components/edit-zone-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { WarehouseFormValues } from '@/lib/locations'
import type { SelectOption } from '@/types/components/form/generic-form.types'
import type { SelectLocationModalVariant, SelectLocationModalWarehouseDto } from '@/types/dto/locations/select-location-modal.types'

type ManageLocationsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type EditEntityKind = 'warehouse' | 'zone' | 'bin'

type CreateEntity = 'warehouse' | 'zone' | 'bin'

type EditSubStep = null | 'addZone' | 'addBin'

function warehouseOptionsFromTree(tree: SelectLocationModalWarehouseDto[]): SelectOption[] {
  return tree.map((w) => ({ label: w.name, value: w.id }))
}

function zoneOptionsFromTree(tree: SelectLocationModalWarehouseDto[]): SelectOption[] {
  return tree.flatMap((w) =>
    w.zones.map((z) => ({ label: `${w.name} / ${z.name}`, value: z.id }))
  )
}

function findZoneBins(
  tree: SelectLocationModalWarehouseDto[],
  zoneId: string
) {
  for (const w of tree) {
    const zone = w.zones.find((z) => z.id === zoneId)
    if (zone) {
      return zone.bins
    }
  }

  return []
}

export function ManageLocationsModal({ open, onOpenChange }: ManageLocationsModalProps) {
  const { tree, isLoading, error, refetch } = useSelectLocationModalData(open)
  const mutations = useManageLocationsCreates(() => {
    void refetch()
  })

  const warehouseOptions = useMemo(() => warehouseOptionsFromTree(tree), [tree])
  const zoneOptions = useMemo(() => zoneOptionsFromTree(tree), [tree])

  const [tab, setTab] = useState('create')
  const [createEntity, setCreateEntity] = useState<CreateEntity | null>(null)
  const [editKind, setEditKind] = useState<EditEntityKind>('warehouse')
  const [editDrilled, setEditDrilled] = useState(false)
  const [editSubStep, setEditSubStep] = useState<EditSubStep>(null)
  const [warehouseId, setWarehouseId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [binId, setBinId] = useState('')

  const hierarchyVariant: SelectLocationModalVariant = editKind

  function resetHierarchy() {
    setWarehouseId('')
    setZoneId('')
    setBinId('')
  }

  function handleEditKindChange(next: string) {
    const kind = next as EditEntityKind
    setEditKind(kind)
    resetHierarchy()
    setEditDrilled(false)
    setEditSubStep(null)
  }

  useEffect(() => {
    if (tab !== 'edit' || editDrilled || editSubStep !== null) {
      return
    }

    const selectionReady =
      (editKind === 'warehouse' && Boolean(warehouseId))
      || (editKind === 'zone' && Boolean(zoneId))
      || (editKind === 'bin' && Boolean(binId))

    if (selectionReady) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional transition after user completes hierarchy pickers
      setEditDrilled(true)
    }
  }, [tab, editKind, warehouseId, zoneId, binId, editDrilled, editSubStep])

  function handleDialogOpenChange(next: boolean) {
    if (!next) {
      setTab('create')
      setCreateEntity(null)
      setEditDrilled(false)
      setEditSubStep(null)
      setEditKind('warehouse')
      setWarehouseId('')
      setZoneId('')
      setBinId('')
    }

    onOpenChange(next)
  }

  function handleDrillBack() {
    if (tab === 'create') {
      setCreateEntity(null)

      return
    }

    if (editSubStep !== null) {
      setEditSubStep(null)

      return
    }

    setEditDrilled(false)
    resetHierarchy()
  }

  const hideMainCreateEditTabs =
    (tab === 'create' && createEntity !== null)
    || (tab === 'edit' && (editDrilled || editSubStep !== null))

  const zoneBins = zoneId ? findZoneBins(tree, zoneId) : []

  const createThrowing = async (
    result: Promise<{ success: boolean; error?: string }>
  ) => {
    const r = await result
    if (!r.success) {
      throw new Error(r.error ?? 'Request failed.')
    }
  }

  const showCreateZoneSkeleton = createEntity === 'zone' && isLoading
  const showCreateBinSkeleton = createEntity === 'bin' && isLoading

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[66vh] max-h-[66vh] min-h-[66vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-full"
      >
        <DialogHeader
          className="shrink-0 space-y-1 border-b border-brand-accent/30 bg-brand-accent/10 px-6 py-4 text-left dark:bg-brand-accent/15"
        >
          <DialogTitle className="text-foreground">Manage locations</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create warehouses, zones, and bins, or edit existing ones without leaving the dashboard.
          </DialogDescription>
        </DialogHeader>

        {hideMainCreateEditTabs ? (
          <div className="flex shrink-0 border-b border-border px-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 px-2"
              onClick={handleDrillBack}
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
          </div>
        ) : null}

        <Tabs
          value={tab}
          onValueChange={(next) => {
            setTab(next)
            setCreateEntity(null)
            setEditDrilled(false)
            setEditSubStep(null)
            resetHierarchy()
          }}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          {!hideMainCreateEditTabs ? (
            <TabsList className="mx-6 mt-4 w-auto shrink-0 justify-start rounded-md bg-muted/60 p-1">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
          ) : null}

          <TabsContent
            value="create"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden outline-none data-[state=inactive]:hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {createEntity === null ? (
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto justify-start gap-4 py-4 pr-4 pl-4 text-left"
                    onClick={() => setCreateEntity('warehouse')}
                  >
                    <Warehouse className="size-5 shrink-0 opacity-90" aria-hidden />
                    <span className="flex min-w-0 flex-col items-start gap-0.5">
                      <span className="text-sm font-semibold">Warehouse</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        Create a new warehouse
                      </span>
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto justify-start gap-4 py-4 pr-4 pl-4 text-left"
                    onClick={() => setCreateEntity('zone')}
                  >
                    <MapPin className="size-5 shrink-0 opacity-90" aria-hidden />
                    <span className="flex min-w-0 flex-col items-start gap-0.5">
                      <span className="text-sm font-semibold">Zone</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        Create a new zone in a warehouse
                      </span>
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto justify-start gap-4 py-4 pr-4 pl-4 text-left"
                    onClick={() => setCreateEntity('bin')}
                  >
                    <ShelvingUnit className="size-5 shrink-0 opacity-90" aria-hidden />
                    <span className="flex min-w-0 flex-col items-start gap-0.5">
                      <span className="text-sm font-semibold">Bin</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        Create a new bin in a zone
                      </span>
                    </span>
                  </Button>
                </div>
              ) : null}

              {createEntity === 'warehouse' ? (
                <CreateWarehouseForm
                  inline
                  mode="full"
                  onCreateWarehouse={(values: WarehouseFormValues) =>
                    createThrowing(mutations.createWarehouse(values))
                  }
                />
              ) : null}

              {createEntity === 'zone' && showCreateZoneSkeleton ? (
                <ManageLocationsZoneCreateFormSkeleton />
              ) : null}

              {createEntity === 'zone' && !showCreateZoneSkeleton ? (
                <CreateZoneForm
                  inline
                  warehouseList={warehouseOptions}
                  onCreateZone={(values) => createThrowing(mutations.createZone(values))}
                />
              ) : null}

              {createEntity === 'bin' && showCreateBinSkeleton ? (
                <ManageLocationsBinCreateFormSkeleton />
              ) : null}

              {createEntity === 'bin' && !showCreateBinSkeleton ? (
                <CreateBinForm
                  inline
                  zonesList={zoneOptions}
                  onCreateBin={(values) => createThrowing(mutations.createBin(values))}
                />
              ) : null}
            </div>
          </TabsContent>

          <TabsContent
            value="edit"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden outline-none data-[state=inactive]:hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {!editDrilled && editSubStep === null ? (
                <div className="space-y-4">
                  <Tabs value={editKind} onValueChange={handleEditKindChange}>
                    <TabsList className="grid h-auto w-full shrink-0 grid-cols-3 gap-1 rounded-md bg-muted/60 p-1">
                      <TabsTrigger
                        value="warehouse"
                        className="gap-1.5 px-2 py-2 text-xs sm:text-sm"
                      >
                        <Warehouse className="size-4 shrink-0" aria-hidden />
                        <span className="truncate">Warehouse</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="zone"
                        className="gap-1.5 px-2 py-2 text-xs sm:text-sm"
                      >
                        <MapPin className="size-4 shrink-0" aria-hidden />
                        <span className="truncate">Zone</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="bin"
                        className="gap-1.5 px-2 py-2 text-xs sm:text-sm"
                      >
                        <ShelvingUnit className="size-4 shrink-0" aria-hidden />
                        <span className="truncate">Bin</span>
                      </TabsTrigger>
                    </TabsList>

                    {isLoading ? (
                      <p className="mt-4 text-sm text-muted-foreground">Loading locations…</p>
                    ) : null}

                    {!isLoading && error ? (
                      <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-3"
                          onClick={() => void refetch()}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : null}

                    {!isLoading && !error ? (
                      <div className="mt-4">
                        <LocationHierarchySelect
                          variant={hierarchyVariant}
                          warehouses={tree}
                          warehouseId={warehouseId}
                          zoneId={zoneId}
                          binId={binId}
                          onWarehouseChange={(id) => {
                            setWarehouseId(id)
                            setZoneId('')
                            setBinId('')
                          }}
                          onZoneChange={(id) => {
                            setZoneId(id)
                            setBinId('')
                          }}
                          onBinChange={setBinId}
                        />
                      </div>
                    ) : null}
                  </Tabs>
                </div>
              ) : null}

              {editDrilled
              && editSubStep === 'addZone'
              && warehouseId ? (
                  <CreateZoneForm
                    inline
                    warehouseList={warehouseOptions}
                    lockedWarehouseId={warehouseId}
                    onCreateZone={async (values) => {
                      await createThrowing(mutations.createZone(values))
                      setEditSubStep(null)
                    }}
                  />
                ) : null}

              {editDrilled && editSubStep === 'addBin' && zoneId ? (
                <CreateBinForm
                  inline
                  zonesList={zoneOptions}
                  lockedZoneId={zoneId}
                  onCreateBin={async (values) => {
                    await createThrowing(mutations.createBin(values))
                    setEditSubStep(null)
                  }}
                />
              ) : null}

              {editDrilled
              && editSubStep === null
              && editKind === 'warehouse'
              && warehouseId ? (
                  <EditWarehouseForm
                    key={warehouseId}
                    warehouseId={warehouseId}
                    enabled={open && tab === 'edit'}
                    onUpdated={() => void refetch()}
                    onRequestAddZone={() => setEditSubStep('addZone')}
                  />
                ) : null}

              {editDrilled
              && editSubStep === null
              && editKind === 'zone'
              && zoneId ? (
                  <EditZoneForm
                    key={zoneId}
                    zoneId={zoneId}
                    enabled={open && tab === 'edit'}
                    zoneBins={zoneBins}
                    onUpdated={() => void refetch()}
                    onRequestAddBin={() => setEditSubStep('addBin')}
                    onCreateBinAndSetZoneDefault={async ({ name, role }) =>
                      mutations.createBinAndSetZoneDefault({
                        zoneId,
                        name,
                        binType: role
                      })
                    }
                  />
                ) : null}

              {editDrilled
              && editSubStep === null
              && editKind === 'bin'
              && binId ? (
                  <EditBinFormContent
                    key={binId}
                    binId={binId}
                    enabled={open && tab === 'edit'}
                    onUpdated={() => void refetch()}
                    setZoneDefaultForBinType={(args) => mutations.setZoneDefaultForBinType(args)}
                  />
                ) : null}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
