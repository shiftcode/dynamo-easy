import { ConditionExpression } from '../type/condition-expression.type'
import { mergeConditions } from './merge-conditions.function'

export function and(...conditions: ConditionExpression[]): ConditionExpression {
  return mergeConditions('AND', conditions)
}
