import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ModelConstructor } from '../../model'
import { createKeyAttributes } from '../create-ket-attributes.function'
import { UpdateExpressionDefinitionFunction } from '../expression/type'
import { prepareAndAddUpdateExpressions } from '../prepare-and-add-update-expressions.function'
import { TransactBaseOperation } from './transact-base-operation'

export class TransactUpdate<T> extends TransactBaseOperation<T, DynamoDB.Update, TransactUpdate<T>> {

  constructor(modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): TransactUpdate<T> {
    prepareAndAddUpdateExpressions(this.metadata, this.params, updateDefFns)
    return this
  }

  get transactItem() {
    return {
      Update: { ...this.params },
    }
  }
}
