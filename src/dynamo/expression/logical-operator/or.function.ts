import { ConditionExpression } from '../type/condition-expression.type'
import { mergeConditions } from './merge-conditions.function'

export function or(...conditions: ConditionExpression[]): ConditionExpression {
  return mergeConditions('OR', conditions)
}
