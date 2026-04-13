import type { EntityTone } from '@/types/components/table/generic-table.types'

export function getEntityTone(tone?: EntityTone) {
  const tones = {
    warehouse: {
      iconClass: 'text-entity-warehouse',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-warehouse), var(--entity-warehouse-end))'
      }
    },
    zone: {
      iconClass: 'text-entity-zone',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-zone), var(--entity-zone-end))'
      }
    },
    bin: {
      iconClass: 'text-entity-bin',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-bin), var(--entity-bin-end))'
      }
    },
    item: {
      iconClass: 'text-brand-primary',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--brand-primary), var(--brand-primary-end))'
      }
    },
    order: {
      iconClass: 'text-brand-primary',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--brand-primary), var(--brand-primary-end))'
      }
    }
  } as const

  return tone ? tones[tone] : tones.item
}
