import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'

export async function getLocations(userId: string): Promise<BasicResponse> {
  try {
    const locations = await prisma.location.findMany({
      where: {
        userId,
      },
    })

    return {
      success: true,
      data: locations,
      message: 'Locations retrieved successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to retrieve locations',
      code: 500,
    }
  }
}

export async function createLocation(
  userId: string,
  name: string,
): Promise<BasicResponse> {
  try {
    const location = await prisma.location.create({
      data: {
        name,
        userId,
      },
    })

    return {
      success: true,
      data: location,
      message: 'Location created successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to create location',
      code: 500,
    }
  }
}

export async function updateLocation(
  userId: string,
  locationId: string,
  data: { name?: string | null; icon?: string | null },
): Promise<BasicResponse> {
  try {
    const existing = await prisma.location.findFirst({
      where: {
        id: locationId,
        userId,
      },
    })

    if (!existing) {
      return {
        success: false,
        data: null,
        message: 'Location not found',
        code: 404,
      }
    }

    if (!data.name && data.icon === undefined) {
      return {
        success: false,
        data: null,
        message: 'No fields to update',
        code: 400,
      }
    }

    const location = await prisma.location.update({
      where: { id: locationId },
      data: {
        name: data.name ?? undefined,
        icon: data.icon ?? undefined,
      },
    })

    return {
      success: true,
      data: location,
      message: 'Location updated successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to update location',
      code: 500,
    }
  }
}

export async function deleteLocation(
  userId: string,
  locationId: string,
): Promise<BasicResponse> {
  try {
    const existing = await prisma.location.findFirst({
      where: {
        id: locationId,
        userId,
      },
    })

    if (!existing) {
      return {
        success: false,
        data: null,
        message: 'Location not found',
        code: 404,
      }
    }

    await prisma.location.delete({
      where: { id: locationId },
    })

    return {
      success: true,
      data: null,
      message: 'Location deleted successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to delete location',
      code: 500,
    }
  }
}
