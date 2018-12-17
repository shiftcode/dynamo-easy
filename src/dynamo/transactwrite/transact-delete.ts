import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { createKeyAttributes } from '../../mapper'
import { ModelConstructor } from '../../model/index'
import { TransactBaseOperation } from './transact-base-operation'

export class TransactDelete<T> extends TransactBaseOperation<T, DynamoDB.Delete, TransactDelete<T>> {
  constructor(modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  get transactItem() {
    return {
      Delete: { ...this.params },
    }
  }
}
