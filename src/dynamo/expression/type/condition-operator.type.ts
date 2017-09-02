/**
 *
 * http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Syntax
 *
 * condition-expression ::=
 *  operand comparator operand
 *    | operand BETWEEN operand AND operand
 *    | operand IN ( operand (',' operand (, ...) ))
 *    | function
 *    | condition AND condition
 *    | condition OR condition
 *    | NOT condition
 *    | ( condition )
 *
 * comparator ::=
 *    =
 *   | <>
 *   | <
 *   | <=
 *   | >
 *   | >=
 *
 * function ::=
 *    attribute_exists (path)
 *    | attribute_not_exists (path)
 *    | attribute_type (path, type)
 *    | begins_with (path, substr)
 *    | contains (path, operand)
 *    | size (path)
 *
 *    TODO size will be always chained if a condition, think about concept
 */

import { OperatorAlias } from './operator-alias.type'
import { OPERATOR_TO_ALIAS_MAP } from './operator-to-alias-map'

export type ConditionOperator =
  | '='
  | '<>'
  | '<='
  | '<'
  | '>='
  | '>'
  | 'attribute_exists'
  | 'attribute_not_exists'
  | 'attribute_type'
  | 'begins_with'
  | 'contains'
  | 'IN'
  | 'BETWEEN'

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

export function aliasForOperator(operator: ConditionOperator): OperatorAlias {
  return Array.isArray(OPERATOR_TO_ALIAS_MAP[operator])
    ? <OperatorAlias>OPERATOR_TO_ALIAS_MAP[operator][0]
    : <OperatorAlias>OPERATOR_TO_ALIAS_MAP[operator]
}
