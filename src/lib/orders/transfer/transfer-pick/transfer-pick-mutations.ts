import type { PrismaClient } from '@/generated/prisma'

import {
  confirmPickLineHandledShared,
  reversePickLineShared,
  type ConfirmPickLineHandledResult,
  type ConfirmPickLineHandledSharedInput,
  type ReversePickLineSharedInput,
  type ReversePickLineSharedResult
} from '@/lib/orders/shared/pick-line-execution'

export type ConfirmTransferPickLineHandledInput = ConfirmPickLineHandledSharedInput

export async function confirmTransferPickLineHandled(
  db: PrismaClient,
  input: ConfirmTransferPickLineHandledInput
): Promise<ConfirmPickLineHandledResult> {
  return confirmPickLineHandledShared(db, 'TRANSFER', input)
}

export type ReverseTransferPickLineInput = ReversePickLineSharedInput

export async function reverseTransferPickLine(
  db: PrismaClient,
  input: ReverseTransferPickLineInput
): Promise<ReversePickLineSharedResult> {
  return reversePickLineShared(db, 'TRANSFER', input)
}
