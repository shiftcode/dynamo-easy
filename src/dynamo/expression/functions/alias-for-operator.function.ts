/**
 * @module expression
 */
import { OperatorAlias } from '../type/condition-operator-alias.type'
import { OPERATOR_TO_ALIAS_MAP } from '../type/condition-operator-to-alias-map.const'
import { ConditionOperator } from '../type/condition-operator.type'

/**
 * @hidden
 */
export function aliasForOperator(operator: ConditionOperator): OperatorAlias {
  return Array.isArray(OPERATOR_TO_ALIAS_MAP[operator])
    ? <OperatorAlias>OPERATOR_TO_ALIAS_MAP[operator][0]
    : <OperatorAlias>OPERATOR_TO_ALIAS_MAP[operator]
}
