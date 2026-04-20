import { Prisma } from '@/generated/prisma'

export const unitsOfMeasure: Prisma.UnitOfMeasureCreateManyInput[] = [
  {
    id: 'PZ',
    description: 'Pieces',
    decimalRound: 0
  },
  {
    id: 'MT',
    description: 'Meters',
    decimalRound: 3
  },
  {
    id: 'KGS',
    description: 'Kilograms',
    decimalRound: 3
  }
]
