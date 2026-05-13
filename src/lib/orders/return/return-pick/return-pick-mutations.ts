import type { PrismaClient } from '@/generated/prisma'

import {
  confirmPickLineHandledShared,
  reversePickLineShared,
  type ConfirmPickLineHandledResult,
  type ConfirmPickLineHandledSharedInput,
  type ReversePickLineSharedInput,
  type ReversePickLineSharedResult
} from '@/lib/orders/shared/pick-line-execution'

export type ConfirmReturnPickLineHandledInput = ConfirmPickLineHandledSharedInput

export async function confirmReturnPickLineHandled(
  db: PrismaClient,
  input: ConfirmReturnPickLineHandledInput
): Promise<ConfirmPickLineHandledResult> {
  return confirmPickLineHandledShared(db, 'RETURN', input)
}

export type ReverseReturnPickLineInput = ReversePickLineSharedInput

export async function reverseReturnPickLine(
  db: PrismaClient,
  input: ReverseReturnPickLineInput
): Promise<ReversePickLineSharedResult> {
  return reversePickLineShared(db, 'RETURN', input)
}
