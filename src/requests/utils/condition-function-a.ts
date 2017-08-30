import { AttributeType } from '../../mapper/attribute-type.type'
import { Condition } from './condition.model'

export interface ConditionFunctionA {
  equals: (value: any) => Condition
  eq: (value: any) => Condition
  ne: (value: any) => Condition
  lte: (value: any) => Condition
  lt: (value: any) => Condition
  gte: (value: any) => Condition
  gt: (value: any) => Condition
  null: () => Condition
  notNull: () => Condition
  contains: (value: any) => Condition
  notContains: (value: any) => Condition
  type: (value: AttributeType) => Condition
  in: (value: any[]) => Condition
  beginsWith: (value: any) => Condition
  between: (value1: any, value2: any) => Condition
  size: () => Condition
}
