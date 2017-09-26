import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { ConditionExpression } from '../type/condition-expression.type'
import { mergeConditions } from './merge-conditions.function'

export function or(
  ...conditionDefinitionFns: ConditionExpressionDefinitionFunction[]
): ConditionExpressionDefinitionFunction {
  return mergeConditions('OR', conditionDefinitionFns)
}
