import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ModelConstructor } from '../../model/index'
import { createKeyAttributes } from '../create-ket-attributes.function'
import { TransactBaseOperation } from './transact-base-operation'

export class TransactDelete<T> extends TransactBaseOperation<T, DynamoDB.Delete, TransactDelete<T>> {
  constructor(
    modelClazz: ModelConstructor<T>,
    partitionKey: any,
    sortKey?: any,
  ) {
    super(modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  get transactItem() {
    return {
      Delete: { ...this.params },
    }
  }
}
