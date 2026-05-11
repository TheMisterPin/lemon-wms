export type SelectLocationModalBinDto = {
  id: string
  name: string
  code: string
  type: string
  isBlocked: boolean
}

export type SelectLocationModalZoneDto = {
  id: string
  name: string
  type: string
  bins: SelectLocationModalBinDto[]
}

export type SelectLocationModalWarehouseDto = {
  id: string
  name: string
  zones: SelectLocationModalZoneDto[]
}

export type SelectLocationModalVariant = 'warehouse' | 'zone' | 'bin'

export type SelectLocationModalConfirmPayload =
  | { variant: 'warehouse'; warehouseId: string }
  | { variant: 'zone'; warehouseId: string; zoneId: string }
  | { variant: 'bin'; warehouseId: string; zoneId: string; binId: string }
