import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { mergeConditions } from './merge-conditions.function'

/**
 * function to combine multiple conditions with or
 * @param conditionDefinitionFns
 */
export function or(
  ...conditionDefinitionFns: ConditionExpressionDefinitionFunction[]
): ConditionExpressionDefinitionFunction {
  return mergeConditions('OR', conditionDefinitionFns)
}
