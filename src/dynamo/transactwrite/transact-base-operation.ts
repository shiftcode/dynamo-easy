/**
 * @module multi-model-requests/transact-write
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Metadata } from '../../decorator/metadata/metadata'
import { metadataForModel } from '../../decorator/metadata/metadata-helper'
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
export abstract class TransactBaseOperation<T,
  I extends DynamoDB.ConditionCheck | DynamoDB.Put | DynamoDB.Update | DynamoDB.Delete,
  R extends TransactBaseOperation<T, I, any>> implements ConditionalParamsHost {
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
  onlyIfAttribute<K extends keyof T>(attributePath: K): RequestConditionFunctionTyped<R, T, K>
  onlyIfAttribute(attributePath: string): RequestConditionFunction<R, T>
  onlyIfAttribute<K extends keyof T>(attributePath: string | K): RequestConditionFunction<R, T> | RequestConditionFunctionTyped<R, T, K> {
    return addCondition<R, T, any>('ConditionExpression', attributePath, <R>(<any>this), this.metadata)
  }

  /**
   * add a condition necessary for the transaction to succeed
   * @example req.onlyIf(or(attribute('age').lt(10), attribute('age').gt(20)))
   */
  onlyIf(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('ConditionExpression', condition, this.params)
    return <R>(<any>this)
  }

  /**
   * get the item attributes if the condition fails
   */
  returnValuesOnConditionCheckFailure(value: DynamoDB.ReturnValuesOnConditionCheckFailure): R {
    this.params.ReturnValuesOnConditionCheckFailure = value
    return <R>(<any>this)
  }
}
