/**
 * @module expression
 */
import { ComparatorOperator } from './comparator-operator.type'
import { FunctionOperator } from './function-operator.type'

/*
 * http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Syntax
 *
 * condition-expression ::= operand comparator operand
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

/**
 * @hidden
 */
export type ConditionOperator = FunctionOperator | ComparatorOperator
