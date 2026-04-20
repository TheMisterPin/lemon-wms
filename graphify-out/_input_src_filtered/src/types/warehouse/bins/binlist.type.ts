
export interface BinList {
    bins: BinItem[];
}
export interface BinItem {
    id: string
    zoneId: string
    name: string
    code: string
    isBlocked: boolean
    blockReason: string | null
    maxCapacity: number
    currentCapacity: number
    filledPercentage: number | null
    itemsInBin: number
    type: string
}
