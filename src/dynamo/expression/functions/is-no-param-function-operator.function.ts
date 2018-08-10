import { NON_PARAM_FUNCTION_OPERATORS } from '../non-param-function-operators.const'
import { FunctionOperator } from '../type/function-operator.type'

/**
 * @returns {boolean} Returns true for all function operators with no param false otherwise
 */
export function isNoParamFunctionOperator(operator: FunctionOperator): boolean {
  return NON_PARAM_FUNCTION_OPERATORS.includes(operator)
}
