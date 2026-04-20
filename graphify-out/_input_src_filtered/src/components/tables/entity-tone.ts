import type { EntityTone } from '@/types/components/table/generic-table.types'

export function getEntityTone(tone?: EntityTone) {
  const tones = {
    warehouse: {
      iconClass: 'text-entity-warehouse',
      titleClass: 'text-entity-warehouse'
    },
    zone: {
      iconClass: 'text-entity-zone',
      titleClass: 'text-entity-zone'
    },
    bin: {
      iconClass: 'text-entity-bin',
      titleClass: 'text-entity-bin'
    },
    item: {
      iconClass: 'text-brand-primary',
      titleClass: 'text-brand-primary'
    },
    order: {
      iconClass: 'text-brand-primary',
      titleClass: 'text-brand-primary'
    }
  } as const

  return tone ? tones[tone] : tones.item
}
