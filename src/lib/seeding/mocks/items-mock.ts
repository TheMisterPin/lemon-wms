import { apparelItems,
  foodAndBeverageItems,
  furnitureItems,
  pharmaceuticalsItems
} from './items'
export const items = [
  ...foodAndBeverageItems,
  ...apparelItems,
  ...foodAndBeverageItems,
  ...pharmaceuticalsItems,
  ...furnitureItems
]
