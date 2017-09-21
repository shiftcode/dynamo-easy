import { FUNCTION_OPERATORS } from '../function-operators.const'
import { ConditionOperator } from '../type/condition-operator.type'

/**
 * An operator can either be an comparator or a function, this method helps to check for function operator
 * @param {ConditionOperator} operator
 * @returns {boolean} Returns true if the operator is a function operator, false otherwise
 */
export function isFunctionOperator(operator: ConditionOperator): boolean {
  return FUNCTION_OPERATORS.includes(operator)
}
