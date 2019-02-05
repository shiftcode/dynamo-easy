import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { createKeyAttributes } from '../../mapper/mapper'
import { ModelConstructor } from '../../model/model-constructor'
import { TransactBaseOperation } from './transact-base-operation'

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
