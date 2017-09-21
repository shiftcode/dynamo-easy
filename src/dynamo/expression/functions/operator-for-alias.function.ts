import { OperatorAlias } from '../type/condition-operator-alias.type'
import { OPERATOR_TO_ALIAS_MAP } from '../type/condition-operator-to-alias-map.const'
import { ConditionOperator } from '../type/condition-operator.type'

export function operatorForAlias(alias: OperatorAlias): ConditionOperator | undefined {
  let operator: ConditionOperator | undefined
  Object.keys(OPERATOR_TO_ALIAS_MAP).forEach((key: ConditionOperator) => {
    const a: string | string[] = OPERATOR_TO_ALIAS_MAP[key]
    if (Array.isArray(alias)) {
      if (a.includes(alias)) {
        operator = key
      }
    } else {
      if (a === alias) {
        operator = key
      }
    }
  })

  return operator
}
