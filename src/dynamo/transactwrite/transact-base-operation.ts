/**
 * @module multi-model-requests/transact-write
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { Metadata } from '../../decorator/metadata/metadata'
import { metadataForModel } from '../../decorator/metadata/metadata-for-model.function'
import { ModelConstructor } from '../../model/model-constructor'
import { and } from '../expression/logical-operator/and.function'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import {
  RequestConditionFunction,
  RequestConditionFunctionTyped,
} from '../expression/type/condition-expression-definition-chain'
import { ConditionExpressionDefinitionFunction } from '../expression/type/condition-expression-definition-function'
import { getTableName } from '../get-table-name.function'
import { ConditionalParamsHost } from '../operation-params.type'

/**
 * Abstract base class for all transact items.
 */
// TODO typings check on unused generic
export abstract class TransactBaseOperation<
  T,
  I extends DynamoDB.ConditionCheck | DynamoDB.Put | DynamoDB.Update | DynamoDB.Delete,
  _R extends TransactBaseOperation<T, I, any>,
> implements ConditionalParamsHost
{
  readonly params: I
  readonly metadata: Metadata<T>
  readonly modelClazz: ModelConstructor<T>

  abstract readonly transactItem: DynamoDB.TransactWriteItem

  protected constructor(modelClazz: ModelConstructor<T>) {
    if (!modelClazz) {
      throw new Error(`please provide the model class`)
    }
    this.modelClazz = modelClazz

    this.metadata = metadataForModel(this.modelClazz)
    if (!this.metadata.modelOptions) {
      throw new Error('the given model class has no model decorator')
    }

    this.params = <I>{
      TableName: getTableName(this.metadata),
    }
  }

  /**
   * create a condition on given attributePath
   * @example req.onlyIfAttribute('age').lt(10)
   */
  onlyIfAttribute<K extends keyof T>(attributePath: K): RequestConditionFunctionTyped<this, T, K>
  onlyIfAttribute(attributePath: string): RequestConditionFunction<this, T>
  onlyIfAttribute<K extends keyof T>(
    attributePath: string | K,
  ): RequestConditionFunction<this, T> | RequestConditionFunctionTyped<this, T, K> {
    return addCondition<this, T, any>('ConditionExpression', attributePath, this, this.metadata)
  }

  /**
   * add a condition necessary for the transaction to succeed
   * @example req.onlyIf(or(attribute('age').lt(10), attribute('age').gt(20)))
   */
  onlyIf(...conditionDefFns: ConditionExpressionDefinitionFunction[]): this {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('ConditionExpression', condition, this.params)
    return this
  }

  /**
   * get the item attributes if the condition fails
   */
  returnValuesOnConditionCheckFailure(value: DynamoDB.ReturnValuesOnConditionCheckFailure): this {
    this.params.ReturnValuesOnConditionCheckFailure = value
    return this
  }
}
