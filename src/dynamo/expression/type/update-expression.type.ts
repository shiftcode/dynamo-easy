/**
 * @module expression
 */
import { Expression } from './expression.type'
import { UpdateActionKeyword } from './update-action-keyword.type'

/**
 * @hidden
 */
export interface UpdateExpression extends Expression {
  type: UpdateActionKeyword
}
