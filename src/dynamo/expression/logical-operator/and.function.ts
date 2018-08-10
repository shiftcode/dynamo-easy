import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { mergeConditions } from './merge-conditions.function'

export function and(
  ...conditionDefinitionFns: ConditionExpressionDefinitionFunction[]
): ConditionExpressionDefinitionFunction {
  return mergeConditions('AND', conditionDefinitionFns)
}
