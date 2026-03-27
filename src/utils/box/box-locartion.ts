import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'

export async function getBoxesByLocation(
  userId: string,
  locationId: string,
): Promise<BasicResponse> {
  try {
    const boxes = await prisma.box.findMany({
      where: {
        locationId,
        location: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: boxes,
      message: 'Boxes retrieved successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to retrieve boxes',
      code: 500,
    }
  }
}

export async function moveBox(
  userId: string,
  boxId: string,
  newLocationId: string,
): Promise<BasicResponse> {
  try {
    const box = await prisma.box.findFirst({
      where: {
        id: boxId,
        userId,
      },
    })

    if (!box) {
      return {
        success: false,
        data: null,
        message: 'Box not found',
        code: 404,
      }
    }

    const location = await prisma.location.findFirst({
      where: {
        id: newLocationId,
        userId,
      },
    })

    if (!location) {
      return {
        success: false,
        data: null,
        message: 'Location not found',
        code: 404,
      }
    }

    const updatedBox = await prisma.box.update({
      where: { id: boxId },
      data: { locationId: newLocationId },
    })

    return {
      success: true,
      data: updatedBox,
      message: 'Box moved successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to move box',
      code: 500,
    }
  }
}
