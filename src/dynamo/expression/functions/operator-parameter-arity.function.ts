/**
 * @module expression
 */
import { ConditionOperator } from '../type/condition-operator.type'
import { isFunctionOperator } from './is-function-operator.function'
import { isNoParamFunctionOperator } from './is-no-param-function-operator.function'

/**
 * Every expression condition operator has a predefined arity (amount) of function parameters, this method
 * returns this value
 *
 * @returns The amount of required method parameters when calling an operator function
 * @hidden
 */
export function operatorParameterArity(operator: ConditionOperator): number {
  if (isFunctionOperator(operator) && isNoParamFunctionOperator(operator)) {
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
      case 'not_contains':
      case 'IN':
        return 1
      case 'BETWEEN':
        return 2
      default:
        throw new Error(`no parameter arity defined for operator ${operator}`)
    }
  }
}
