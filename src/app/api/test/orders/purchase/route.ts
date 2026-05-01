import prisma from '@/lib/prisma'

export async function GET() {

  const orders = await prisma.purchaseOrder.findMany({
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      businessPartyId: true,
      lines: true,
      receipts: {
        select: {
          id: true,
          status: true,
          totalProcessedQuantity: true,
          lines: {
            select: {
              id: true,
              quantity: true
            }
          }
        }
      }
    }
  })

  return Response.json(orders)
}
