/**
 * @module expression
 */
import { FUNCTION_OPERATORS } from '../function-operators.const'
import { ConditionOperator } from '../type/condition-operator.type'
import { FunctionOperator } from '../type/function-operator.type'

/**
 * An operator can either be an comparator or a function, this method helps to check for function operator
 *
 * @param operator
 * @returns Returns true if the operator is a function operator, false otherwise
 * @hidden
 */
export function isFunctionOperator(operator: ConditionOperator): operator is FunctionOperator {
  return (<any[]>FUNCTION_OPERATORS).includes(operator)
}
