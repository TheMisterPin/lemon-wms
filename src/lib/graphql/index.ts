import { builder } from './schema'

import './types/_base'
import './types/orders'
import './types/stock'
import './types/locations'
import './types/iam'

export const schema = builder.toSchema()
