import { AttributeType } from '../../../mapper/type/attribute-type.type'
import { ConditionalParamsHost } from '../../operation-params.type'

export interface RequestConditionFunction<T extends ConditionalParamsHost> {
  equals: (value: any) => T
  eq: (value: any) => T
  ne: (value: any) => T
  lte: (value: any) => T
  lt: (value: any) => T
  gte: (value: any) => T
  gt: (value: any) => T
  null: () => T
  notNull: () => T
  contains: (value: any) => T
  notContains: (value: any) => T
  type: (value: AttributeType) => T
  in: (value: any[]) => T
  beginsWith: (value: any) => T
  between: (value1: any, value2: any) => T
}
