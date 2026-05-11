export type StockCategoryTreeNodeDto = {
  code: string
  name: string
  iconUrl: string | null
}

export type StockCategoryTreeDTO = {
  parents: StockCategoryTreeNodeDto[]
  childrenByParentCode: Record<string, StockCategoryTreeNodeDto[]>
}
