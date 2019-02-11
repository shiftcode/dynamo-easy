/**
 * @module expression
 */
import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { mergeConditions } from './merge-conditions.function'

/**
 * function to combine multiple conditions with 'and'
 * @example
 * ```typescript
 * and(attribute('propA').eq('foo'), attribute('propB').eq('bar'))
 * ```
 */
export function and(
  ...conditionDefinitionFns: ConditionExpressionDefinitionFunction[]
): ConditionExpressionDefinitionFunction {
  return mergeConditions('AND', conditionDefinitionFns)
}
