'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Layers, Tags } from 'lucide-react'

import { CategoryPickerIcon } from '@/components/primitives/media/category-icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { StockCategoryTreeDTO } from '@/types/stock-category-tree.types'

type SelectStockSubcategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tree: StockCategoryTreeDTO | null
  isLoading: boolean
  error: string | null
  onRefetch: () => void
  onConfirm: (subcategoryCode: string) => void
}

type FieldShellProps = {
  label: string
  description: string
  iconUrl: string | null
  fallbackIcon: typeof Tags
  children: ReactNode
}

function FieldShell({ label, description, iconUrl, fallbackIcon: FallbackIcon, children }: FieldShellProps) {
  return (
    <div className={cn('space-y-3 rounded-lg border border-border bg-card/50 p-4 shadow-sm')}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/80 text-muted-foreground'
          )}
        >
          <CategoryPickerIcon iconUrl={iconUrl} fallback={FallbackIcon} size={20} />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-none">{label}</p>
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function SelectStockSubcategoryModal({
  open,
  onOpenChange,
  tree,
  isLoading,
  error,
  onRefetch,
  onConfirm
}: SelectStockSubcategoryModalProps) {
  const [parentCode, setParentCode] = useState<string>('')
  const [subcategoryCode, setSubcategoryCode] = useState<string>('')

  const parentsWithChildren = useMemo(() => {
    if (!tree) {
      return []
    }

    return tree.parents.filter((p) => (tree.childrenByParentCode[p.code] ?? []).length > 0)
  }, [tree])

  const selectedParent = useMemo(
    () => parentsWithChildren.find((p) => p.code === parentCode),
    [parentsWithChildren, parentCode]
  )

  const childOptions = useMemo(() => {
    if (!tree || !selectedParent) {
      return []
    }

    return tree.childrenByParentCode[selectedParent.code] ?? []
  }, [tree, selectedParent])

  const selectedChild = useMemo(
    () => childOptions.find((c) => c.code === subcategoryCode),
    [childOptions, subcategoryCode]
  )

  const canConfirm = Boolean(selectedChild)

  const handleConfirm = () => {
    if (!selectedChild) {
      return
    }

    onConfirm(selectedChild.code)
    onOpenChange(false)
    setParentCode('')
    setSubcategoryCode('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setParentCode('')
          setSubcategoryCode('')
        }
        onOpenChange(next)
      }}
    >
      <DialogContent
        className="flex max-h-[min(90vh,640px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle>Open a subcategory</DialogTitle>
          <DialogDescription>
            Pick the parent category, then a child subcategory to open its stock dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading categories…</p>
          ) : null}

          {!isLoading && error ? (
            <div
              className={cn(
                'rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
              )}
            >
              <p>{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onRefetch()}
              >
                Try again
              </Button>
            </div>
          ) : null}

          {!isLoading && !error && tree && parentsWithChildren.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No parent categories with subcategories were found.
            </p>
          ) : null}

          {!isLoading && !error && tree && parentsWithChildren.length > 0 ? (
            <>
              <FieldShell
                fallbackIcon={Tags}
                iconUrl={selectedParent?.iconUrl ?? null}
                label="Parent category"
                description="Which catalog branch should we use?"
              >
                <div className="space-y-2">
                  <Label htmlFor="select-stock-parent-cat" className="sr-only">
                    Parent category
                  </Label>
                  <Select
                    value={parentCode || undefined}
                    onValueChange={(value) => {
                      setParentCode(value)
                      setSubcategoryCode('')
                    }}
                  >
                    <SelectTrigger
                      id="select-stock-parent-cat"
                      className="h-10 w-full border-input bg-background"
                      size="default"
                    >
                      <SelectValue placeholder="Select parent category">
                        {selectedParent ? (
                          <span className="flex items-center gap-2">
                            <CategoryPickerIcon
                              iconUrl={selectedParent.iconUrl}
                              fallback={Tags}
                              size={18}
                            />
                            <span>{selectedParent.name}</span>
                          </span>
                        ) : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
                      {parentsWithChildren.map((p) => (
                        <SelectItem key={p.code} value={p.code} textValue={p.name}>
                          <span className="flex items-center gap-2">
                            <CategoryPickerIcon iconUrl={p.iconUrl} fallback={Tags} size={18} />
                            <span className="flex flex-col gap-0.5">
                              <span className="font-medium leading-tight">{p.name}</span>
                              <span className="font-mono text-xs text-muted-foreground">{p.code}</span>
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FieldShell>

              <FieldShell
                fallbackIcon={Layers}
                iconUrl={selectedChild?.iconUrl ?? null}
                label="Subcategory"
                description={
                  selectedParent
                    ? `Subcategories under ${selectedParent.name}`
                    : 'Select a parent category first.'
                }
              >
                <div className="space-y-2">
                  <Label htmlFor="select-stock-sub-cat" className="sr-only">
                    Subcategory
                  </Label>
                  <Select
                    value={subcategoryCode || undefined}
                    onValueChange={setSubcategoryCode}
                    disabled={!selectedParent}
                  >
                    <SelectTrigger
                      id="select-stock-sub-cat"
                      className="h-10 w-full border-input bg-background"
                      size="default"
                    >
                      <SelectValue
                        placeholder={
                          selectedParent ? 'Select subcategory' : 'Select parent category first'
                        }
                      >
                        {selectedChild ? (
                          <span className="flex items-center gap-2">
                            <CategoryPickerIcon
                              iconUrl={selectedChild.iconUrl}
                              fallback={Layers}
                              size={18}
                            />
                            <span>{selectedChild.name}</span>
                          </span>
                        ) : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
                      {childOptions.map((c) => (
                        <SelectItem key={c.code} value={c.code} textValue={c.name}>
                          <span className="flex items-center gap-2">
                            <CategoryPickerIcon iconUrl={c.iconUrl} fallback={Layers} size={18} />
                            <span className="flex flex-col gap-0.5">
                              <span className="font-medium leading-tight">{c.name}</span>
                              <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FieldShell>
            </>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setParentCode('')
              setSubcategoryCode('')
            }}
            disabled={isLoading || Boolean(error)}
          >
            Reset
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || isLoading || Boolean(error)}
            >
              Open
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
