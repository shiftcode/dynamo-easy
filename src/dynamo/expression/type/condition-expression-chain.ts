import { AttributeType } from '../../../mapper/type/attribute.type'
import { Expression } from './expression.type'

export interface ConditionExpressionChain {
  equals: (value: any) => Expression
  eq: (value: any) => Expression
  ne: (value: any) => Expression
  lte: (value: any) => Expression
  lt: (value: any) => Expression
  gte: (value: any) => Expression
  gt: (value: any) => Expression
  null: () => Expression
  notNull: () => Expression
  contains: (value: any) => Expression
  notContains: (value: any) => Expression
  type: (value: AttributeType) => Expression
  in: (value: any[]) => Expression
  beginsWith: (value: any) => Expression
  between: (value1: any, value2: any) => Expression
}
