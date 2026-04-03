
export interface BinList {
    bins: BinItem[];
}
export interface BinItem {
    id: string
    zoneId: string
    name: string
    isBlocked: boolean
    blockReason: string | null
    active: boolean
    maxCapacity: number
    type: string
    currentCapacity: number
}
