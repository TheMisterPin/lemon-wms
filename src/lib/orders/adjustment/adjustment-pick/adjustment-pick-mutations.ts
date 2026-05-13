import type { PrismaClient } from '@/generated/prisma'

import {
  confirmPickLineHandledShared,
  reversePickLineShared,
  type ConfirmPickLineHandledResult,
  type ConfirmPickLineHandledSharedInput,
  type ReversePickLineSharedInput,
  type ReversePickLineSharedResult
} from '@/lib/orders/shared/pick-line-execution'

export type ConfirmAdjustmentPickLineHandledInput = ConfirmPickLineHandledSharedInput

export async function confirmAdjustmentPickLineHandled(
  db: PrismaClient,
  input: ConfirmAdjustmentPickLineHandledInput
): Promise<ConfirmPickLineHandledResult> {
  return confirmPickLineHandledShared(db, 'ADJUSTMENT', input)
}

export type ReverseAdjustmentPickLineInput = ReversePickLineSharedInput

export async function reverseAdjustmentPickLine(
  db: PrismaClient,
  input: ReverseAdjustmentPickLineInput
): Promise<ReversePickLineSharedResult> {
  return reversePickLineShared(db, 'ADJUSTMENT', input)
}
