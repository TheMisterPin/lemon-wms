import type { IUnitOfMeasure } from './unit-of-measure'

export interface IBoxLine {
  id: string
  boxId: string
  warItemId: string
  quantity: number
  lotId: string | null
  serialNumberId: string | null
  uomCode: string
  uom?: IUnitOfMeasure
}
