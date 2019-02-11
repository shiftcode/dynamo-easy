/**
 * @module multi-model-requests/transact-write
 */
import { TransactConditionCheck } from './transact-condition-check'
import { TransactDelete } from './transact-delete'
import { TransactPut } from './transact-put'
import { TransactUpdate } from './transact-update'
/**
 * @hidden
 */
export type TransactOperation =
  | TransactConditionCheck<any>
  | TransactDelete<any>
  | TransactPut<any>
  | TransactUpdate<any>
