/**
 *
 * update expressions support these 4 base operations:
 *
 * update-expression ::=
 * [ SET action [, action] ... ]
 * [ REMOVE action [, action] ...]
 * [ ADD action [, action] ... ]
 * [ DELETE action [, action] ...]
 *
 * we provide our own aliases for easier usage
 */
import { UpdateActionKeyword } from './update-action-keyword.type'

export type UpdateAction =
  | 'incrementBy'
  | 'decrementBy'
  | 'set'
  | 'setAt'
  | 'appendToList'
  | 'remove'
  | 'removeFromListAt'
  | 'add'
  | 'removeFromSet'
