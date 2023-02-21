/**
 * @module multi-model-requests/transact-write
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createKeyAttributes } from '../../mapper/mapper'
import { ModelConstructor } from '../../model/model-constructor'
import { TransactBaseOperation } from './transact-base-operation'

/**
 * TransactOperation class for transactional condition checks.
 */
export class TransactConditionCheck<T> extends TransactBaseOperation<
  T,
  DynamoDB.ConditionCheck,
  TransactConditionCheck<T>
> {
  constructor(modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  get transactItem() {
    return {
      ConditionCheck: { ...this.params },
    }
  }
}
