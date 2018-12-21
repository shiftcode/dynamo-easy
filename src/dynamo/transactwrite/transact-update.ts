import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { createKeyAttributes } from '../../mapper'
import { ModelConstructor } from '../../model'
import { prepareAndAddUpdateExpressions } from '../expression/prepare-and-add-update-expressions.function'
import { addUpdate } from '../expression/request-expression-builder'
import { RequestUpdateFunction, UpdateExpressionDefinitionFunction } from '../expression/type'
import { TransactBaseOperation } from './transact-base-operation'

export class TransactUpdate<T> extends TransactBaseOperation<T, DynamoDB.Update, TransactUpdate<T>> {
  constructor(modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  updateAttribute<K extends keyof T>(attributePath: K): RequestUpdateFunction<TransactUpdate<T>, T, K> {
    return addUpdate(attributePath, this, this.metadata)
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
