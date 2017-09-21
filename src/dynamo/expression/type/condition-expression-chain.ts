import { AttributeType } from '../../../mapper/type/attribute.type'
import { ConditionExpression } from './condition-expression.type'

export interface ConditionExpressionChain {
  equals: (value: any) => ConditionExpression
  eq: (value: any) => ConditionExpression
  ne: (value: any) => ConditionExpression
  lte: (value: any) => ConditionExpression
  lt: (value: any) => ConditionExpression
  gte: (value: any) => ConditionExpression
  gt: (value: any) => ConditionExpression
  null: () => ConditionExpression
  notNull: () => ConditionExpression
  contains: (value: any) => ConditionExpression
  notContains: (value: any) => ConditionExpression
  type: (value: AttributeType) => ConditionExpression
  in: (value: any[]) => ConditionExpression
  beginsWith: (value: any) => ConditionExpression
  between: (value1: any, value2: any) => ConditionExpression
}
