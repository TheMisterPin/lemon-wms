import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'

export async function getBoxesByUser(userId: string): Promise<BasicResponse> {
  try {
    const boxes = await prisma.box.findMany({
      where: {
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

export async function getBoxById(
  userId: string,
  boxId: string,
): Promise<BasicResponse> {
  try {
    const box = await prisma.box.findFirst({
      where: {
        id: boxId,
        location: {
          userId,
        },
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

    return {
      success: true,
      data: box,
      message: 'Box retrieved successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to retrieve box',
      code: 500,
    }
  }
}

export async function createBox(
  userId: string,
  locationId: string,
  name: string,
  description?: string | null,
  closedImage?: string | null,
  contentsImage?: string | null,
): Promise<BasicResponse> {
  try {
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
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

    const box = await prisma.box.create({
      data: {
        name,
        description,
        closedImage,
        contentsImage,
        locationId,
        userId,
      },
    })

    return {
      success: true,
      data: box,
      message: 'Box created successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to create box',
      code: 500,
    }
  }
}

export async function updateBox(
  userId: string,
  boxId: string,
  data: {
    name?: string
    description?: string | null
    closedImage?: string | null
    contentsImage?: string | null
  },
): Promise<BasicResponse> {
  try {
    const existing = await prisma.box.findFirst({
      where: {
        id: boxId,
        location: {
          userId,
        },
      },
    })

    if (!existing) {
      return {
        success: false,
        data: null,
        message: 'Box not found',
        code: 404,
      }
    }

    if (
      !data.name &&
      data.description === undefined &&
      data.closedImage === undefined &&
      data.contentsImage === undefined
    ) {
      return {
        success: false,
        data: null,
        message: 'No fields to update',
        code: 400,
      }
    }

    const box = await prisma.box.update({
      where: { id: boxId },
      data: {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        closedImage: data.closedImage ?? undefined,
        contentsImage: data.contentsImage ?? undefined,
      },
    })

    return {
      success: true,
      data: box,
      message: 'Box updated successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to update box',
      code: 500,
    }
  }
}

export async function deleteBox(
  userId: string,
  boxId: string,
): Promise<BasicResponse> {
  try {
    if (!boxId) {
      return {
        success: false,
        data: null,
        message: 'Box id is required',
        code: 400,
      }
    }

    const result = await prisma.box.deleteMany({
      where: {
        id: boxId,
        location: {
          userId,
        },
      },
    })

    if (result.count === 0) {
      return {
        success: false,
        data: null,
        message: 'Box not found',
        code: 404,
      }
    }

    return {
      success: true,
      data: null,
      message: 'Box deleted successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to delete box',
      code: 500,
    }
  }
}
