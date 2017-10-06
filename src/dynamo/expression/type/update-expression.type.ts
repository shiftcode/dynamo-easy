import { Expression } from './expression.type'
import { UpdateActionKeyword } from './update-action-keyword.type'

export interface UpdateExpression extends Expression {
  type: UpdateActionKeyword
}
