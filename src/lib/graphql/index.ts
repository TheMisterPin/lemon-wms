import { builder } from './schema'

import './types/shared'
import './types/orders'
import './types/stock'
import './types/inventory-health'
import './types/warehouses'
import './types/iam'

export const schema = builder.toSchema()
