import type { PrismaClient } from '@/generated/prisma'

import {
  confirmPickLineHandledShared,
  reversePickLineShared,
  type ConfirmPickLineHandledResult,
  type ConfirmPickLineHandledSharedInput,
  type ReversePickLineSharedInput,
  type ReversePickLineSharedResult
} from '@/lib/orders/shared/pick-line-execution'

export type ConfirmSalesPickLineHandledInput = ConfirmPickLineHandledSharedInput

export async function confirmSalesPickLineHandled(
  db: PrismaClient,
  input: ConfirmSalesPickLineHandledInput
): Promise<ConfirmPickLineHandledResult> {
  return confirmPickLineHandledShared(db, 'SALES', input)
}

export type ReverseSalesPickLineInput = ReversePickLineSharedInput

export async function reverseSalesPickLine(
  db: PrismaClient,
  input: ReverseSalesPickLineInput
): Promise<ReversePickLineSharedResult> {
  return reversePickLineShared(db, 'SALES', input)
}
