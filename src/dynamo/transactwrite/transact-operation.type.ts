import { TransactConditionCheck } from './transact-condition-check'
import { TransactDelete } from './transact-delete'
import { TransactPut } from './transact-put'
import { TransactUpdate } from './transact-update'

export type TransactOperation =
  | TransactConditionCheck<any>
  | TransactDelete<any>
  | TransactPut<any>
  | TransactUpdate<any>
