/**
 * @module expression
 */
import { FunctionOperator } from './type/function-operator.type'

/**
 * @hidden
 */
export const FUNCTION_OPERATORS: FunctionOperator[] = [
  'attribute_exists',
  'attribute_not_exists',
  'attribute_type',
  'begins_with',
  'contains',
  'not_contains',
  'IN',
  'BETWEEN',
]
