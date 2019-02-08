/**
 * @module expression
 */
import { UpdateActionDef } from './update-action-def'

/**
 * @hidden
 */
export const UPDATE_ACTION_DEFS: UpdateActionDef[] = [
  // SET
  new UpdateActionDef('SET', 'incrementBy'),
  new UpdateActionDef('SET', 'decrementBy'),
  new UpdateActionDef('SET', 'set'),
  new UpdateActionDef('SET', 'appendToList'),
  // REMOVE
  new UpdateActionDef('REMOVE', 'remove'),
  new UpdateActionDef('REMOVE', 'removeFromListAt'),
  // ADD
  new UpdateActionDef('ADD', 'add'),
  // DELETE
  new UpdateActionDef('DELETE', 'removeFromSet'),
]
