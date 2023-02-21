/**
 * @module multi-model-requests/transact-write
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { toDb } from '../../mapper/mapper'
import { ModelConstructor } from '../../model/model-constructor'
import { createIfNotExistsCondition } from '../expression/create-if-not-exists-condition.function'
import { TransactBaseOperation } from './transact-base-operation'

/**
 * TransactOperation class for transactional put items.
 */
export class TransactPut<T> extends TransactBaseOperation<T, DynamoDB.Put, TransactPut<T>> {
  constructor(modelClazz: ModelConstructor<T>, item: T) {
    super(modelClazz)
    this.params.Item = toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   */
  ifNotExists(predicate: boolean = true): this {
    if (predicate) {
      this.onlyIf(...createIfNotExistsCondition(this.metadata))
    }
    return this
  }

  get transactItem() {
    return {
      Put: { ...this.params },
    }
  }
}
