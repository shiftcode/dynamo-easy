import { ConditionOperator } from '../type/condition-operator.type'
import { isNoParamFunctionOperator } from './is-no-param-function-operator.function'

/**
 * Every expression condition operator has a predefined arity (amount) of function paramers, this method
 * returns this value
 *
 * @param {ConditionOperator} operator
 * @returns {number} The amount of required method parameters when calling an operator function
 */
export function operatorParameterArity(operator: ConditionOperator): number {
  if (isNoParamFunctionOperator(operator)) {
    return 0
  } else {
    switch (operator) {
      case '=':
      case '>':
      case '>=':
      case '<':
      case '<=':
      case '<>':
      case 'begins_with':
      case 'attribute_type':
      case 'contains':
      case 'IN':
        return 1
      case 'BETWEEN':
        return 2
      default:
        throw new Error(`no parameter arity defined for opererator ${operator}`)
    }
  }
}
