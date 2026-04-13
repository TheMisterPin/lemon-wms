import type { ReactNode } from 'react'

export type ColumnType =
  | 'text'
  | 'date'
  | 'number'
  | 'boolean'
  | 'progress'
  | 'indicator'
  | 'joinValues'
  | 'operation'

export interface TextTypeValues {
  format?: 'capitalize' | 'uppercase' | 'lowercase' | 'titlecase'
  className?: string
  userSelect?: boolean
  clip?: number
}

export interface DateTypeValues {
  dateType: 'daydate' | 'datetime' | 'time'
  className?: string
}

export interface NumberTypeValues {
  mode: 'decimal' | 'int'
  decimalRound?: number
  negativeStyle?: string
  positiveStyle?: string
}

export interface BooleanTypeValues {
  trueIcon?: ReactNode
  falseIcon?: ReactNode
  trueStyle?: string
  falseStyle?: string
}

export interface ProgressTypeValues {
  current: string
  max: string
  fromColor?: string
  toColor?: string
  showPercentage?: boolean
}

export interface IndicatorTypeValues {
  conditions: Record<string, string>
  defaultColor?: string
  animation?: 'blink' | 'none' | 'spin'
}

export interface JoinValuesTypeValues {
  values: string[]
  separator?: string
  nullCheck?: boolean
}

export type TableOperation = '+' | '-' | '/' | 'x' | '%' | 'fraction'

export interface OperationTypeValues {
  operation: TableOperation
  values: string[]
  decimalRound?: number
}

export type TypeValuesMap = {
  text: TextTypeValues
  date: DateTypeValues
  number: NumberTypeValues
  boolean: BooleanTypeValues
  progress: ProgressTypeValues
  indicator: IndicatorTypeValues
  joinValues: JoinValuesTypeValues
  operation: OperationTypeValues
}

export type StyleCondition =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'truthy'
  | 'falsy'
  | 'positive'
  | 'negative'

export interface StyleIfRule {
  value?: unknown
  condition: StyleCondition
  className: string
}

export interface ColumnStyleConfig {
  className?: string
  styleIf?: StyleIfRule[]
}

export interface BaseDataColumnConfig {
  label: string
  accessor: string
  styles?: ColumnStyleConfig
  hideIfNulls?: boolean
  ifNull?: string
  sortable?: boolean
}

export type DataColumnConfig =
  | (BaseDataColumnConfig & { type?: 'text'; typeValues?: TextTypeValues })
  | (BaseDataColumnConfig & { type: 'date'; typeValues?: DateTypeValues })
  | (BaseDataColumnConfig & { type: 'number'; typeValues?: NumberTypeValues })
  | (BaseDataColumnConfig & { type: 'boolean'; typeValues?: BooleanTypeValues })
  | (BaseDataColumnConfig & { type: 'progress'; typeValues?: ProgressTypeValues })
  | (BaseDataColumnConfig & { type: 'indicator'; typeValues?: IndicatorTypeValues })
  | (BaseDataColumnConfig & { type: 'joinValues'; typeValues?: JoinValuesTypeValues })
  | (BaseDataColumnConfig & { type: 'operation'; typeValues?: OperationTypeValues })

export interface CustomCellColumnConfig<T extends { id: string }> {
  label: string
  cell: (row: T) => ReactNode
  sortable?: false
  styles?: ColumnStyleConfig
}

export type ColumnConfig<T extends { id: string }> =
  | DataColumnConfig
  | CustomCellColumnConfig<T>
