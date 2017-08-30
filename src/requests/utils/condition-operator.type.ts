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
 */

export type OperatorAlias =
  | 'equals'
  | 'eq'
  | 'ne'
  | 'lte'
  | 'lt'
  | 'gte'
  | 'gt'
  | 'null'
  | 'notNull'
  | 'type'
  | 'beginsWith'
  | 'contains'
  | 'size'
  | 'in'
  | 'between'

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
  | 'size'
  | 'IN'
  | 'BETWEEN'

export const CONDITION_OPERATOR_ALIAS: { [key in ConditionOperator]: OperatorAlias | OperatorAlias[] } = {
  '=': ['equals', 'eq'],
  '<>': 'ne',
  '<=': 'lte',
  '<': 'lt',
  '>=': 'gte',
  '>': 'gt',
  attribute_not_exists: 'null',
  attribute_exists: 'notNull',
  attribute_type: 'type',
  contains: 'contains',
  IN: 'in',
  begins_with: 'beginsWith',
  BETWEEN: 'between',
  size: 'size',
}

export function operatorForAlias(alias: OperatorAlias): ConditionOperator | undefined {
  let operator: ConditionOperator | undefined
  Object.keys(CONDITION_OPERATOR_ALIAS).forEach((key: ConditionOperator) => {
    const a: string | string[] = CONDITION_OPERATOR_ALIAS[key]
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
  return Array.isArray(CONDITION_OPERATOR_ALIAS[operator])
    ? <OperatorAlias>CONDITION_OPERATOR_ALIAS[operator][0]
    : <OperatorAlias>CONDITION_OPERATOR_ALIAS[operator]
}
