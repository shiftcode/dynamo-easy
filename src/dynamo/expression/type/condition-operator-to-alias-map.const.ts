/* eslint-disable camelcase */
/**
 * @module expression
 */
import { OperatorAlias } from './condition-operator-alias.type'
import { ConditionOperator } from './condition-operator.type'

/**
 * mapped type
 *
 * @hidden
 */
export interface AliasedOperatorMapEntry extends Record<ConditionOperator, OperatorAlias | OperatorAlias[]> {
  // index signature
  [key: string]: OperatorAlias | OperatorAlias[]
}

/**
 * @hidden
 */
export const OPERATOR_TO_ALIAS_MAP: AliasedOperatorMapEntry = {
  '=': ['equals', 'eq'],
  '<>': 'ne',
  '<=': 'lte',
  '<': 'lt',
  '>=': 'gte',
  '>': 'gt',
  attribute_not_exists: ['attributeNotExists', 'null'],
  attribute_exists: ['attributeExists', 'notNull'],
  attribute_type: 'type',
  contains: 'contains',
  not_contains: 'notContains',
  IN: 'in',
  begins_with: 'beginsWith',
  BETWEEN: 'between',
}
