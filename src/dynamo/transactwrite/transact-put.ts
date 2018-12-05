import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { toDb } from '../../mapper'
import { ModelConstructor } from '../../model'
import { createIfNotExistsCondition } from '../create-if-not-exists-condition.function'
import { TransactBaseOperation } from './transact-base-operation'

export class TransactPut<T> extends TransactBaseOperation<T, DynamoDB.Put, TransactPut<T>> {

  constructor(
    modelClazz: ModelConstructor<T>,
    item: T,
  ) {
    super(modelClazz)
    this.params.Item = toDb(item, this.modelClazz)
  }

  ifNotExists(predicate: boolean = true): TransactPut<T> {
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
