/**
 * @module expression
 */
import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { mergeConditions } from './merge-conditions.function'

/**
 * function to combine multiple conditions with or
 * @example
 * ```typescript
 * or(attribute('propA').eq('foo'), attribute('propB').eq('bar'))
 * ```
 */
export function or(
  ...conditionDefinitionFns: ConditionExpressionDefinitionFunction[]
): ConditionExpressionDefinitionFunction {
  return mergeConditions('OR', conditionDefinitionFns)
}
