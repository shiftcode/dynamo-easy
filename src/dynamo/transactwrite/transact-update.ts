/**
 * @module multi-model-requests/transact-write
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createKeyAttributes } from '../../mapper/mapper'
import { ModelConstructor } from '../../model/model-constructor'
import { prepareAndAddUpdateExpressions } from '../expression/prepare-and-add-update-expressions.function'
import { addUpdate } from '../expression/request-expression-builder'
import { RequestUpdateFunction } from '../expression/type/update-expression-definition-chain'
import { UpdateExpressionDefinitionFunction } from '../expression/type/update-expression-definition-function'
import { TransactBaseOperation } from './transact-base-operation'

/**
 * TransactOperation class for transactional update items.
 */
export class TransactUpdate<T> extends TransactBaseOperation<T, DynamoDB.Update, TransactUpdate<T>> {
  constructor(modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  /**
   * create and add a single update operation
   * @example updtTrans.updateAttribute('path.to.attr').set('newVal')
   */
  updateAttribute<K extends keyof T>(attributePath: K): RequestUpdateFunction<this, T, K> {
    return addUpdate(attributePath, this, this.metadata)
  }

  /**
   * add multiple update ops
   * @example updtTrans.operations(update('path.to.attr).set('newVal'), ... )
   */
  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): this {
    prepareAndAddUpdateExpressions(this.metadata, this.params, updateDefFns)
    return this
  }

  get transactItem() {
    return {
      Update: { ...this.params },
    }
  }
}
