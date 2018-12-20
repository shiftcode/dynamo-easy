import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Metadata, metadataForClass } from '../../decorator/metadata/index'
import { ModelConstructor } from '../../model/model-constructor'
import { RequestConditionFunction } from '../expression'
import { and } from '../expression/logical-operator/index'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../expression/type/index'
import { getTableName } from '../get-table-name.function'
import { ConditionalParamsHost } from '../operation-params.type'

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

    this.metadata = metadataForClass(this.modelClazz)
    if (!this.metadata.modelOptions) {
      throw new Error('the given model class has no model decorator')
    }

    this.params = <I>{
      TableName: getTableName(this.metadata),
    }
  }

  onlyIfAttribute<K extends keyof T>(attributePath: K): RequestConditionFunction<R, T, K> {
    return addCondition('ConditionExpression', attributePath, <R>(<any>this), this.metadata)
  }

  onlyIf(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('ConditionExpression', condition, this.params)
    return <R>(<any>this)
  }

  returnValuesOnConditionCheckFailure(value: DynamoDB.ReturnValuesOnConditionCheckFailure): R {
    this.params.ReturnValuesOnConditionCheckFailure = value
    return <R>(<any>this)
  }
}
