import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ModelConstructor } from '../../model'
import { createKeyAttributes } from '../create-ket-attributes.function'
import { TransactBaseOperation } from './transact-base-operation'

export class TransactConditionCheck<T> extends TransactBaseOperation<T, DynamoDB.ConditionCheck, TransactConditionCheck<T>> {
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

