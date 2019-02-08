/**
 * @module expression
 */
import { OperatorAlias } from '../type/condition-operator-alias.type'
import { OPERATOR_TO_ALIAS_MAP } from '../type/condition-operator-to-alias-map.const'
import { ConditionOperator } from '../type/condition-operator.type'

/**
 * @hidden
 */
export function operatorForAlias(alias: OperatorAlias): ConditionOperator | undefined {
  let operator: ConditionOperator | undefined
  Object.keys(OPERATOR_TO_ALIAS_MAP).forEach(key => {
    const a = OPERATOR_TO_ALIAS_MAP[key]
    if (Array.isArray(a)) {
      if (a.includes(alias)) {
        operator = <ConditionOperator>key
      }
    } else {
      if (a === alias) {
        operator = <ConditionOperator>key
      }
    }
  })

  return operator
}
