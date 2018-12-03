import { Metadata, metadataForClass } from '../../decorator/metadata'
import { ModelConstructor } from '../../model/model-constructor'
import { and } from '../expression/logical-operator'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction, RequestConditionFunction } from '../expression/type'
import { getTableName } from '../get-table-name.function'
import { ConditionalParamsHost } from '../operation-params.type'
import { WriteOperationParams } from './write-operation-params.type'

export abstract class WriteOperation<T,
  I extends WriteOperationParams,
  R extends WriteOperation<T, I, any>> implements ConditionalParamsHost {

  readonly params: I
  readonly metadata: Metadata<T>
  readonly modelClazz: ModelConstructor<T>

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

  onlyIfAttribute(attributePath: keyof T): RequestConditionFunction<R> {
    return addCondition('ConditionExpression', <string>attributePath, <R><any>this, this.metadata)
  }

  onlyIf(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('ConditionExpression', condition, this.params)
    return <R>(<any>this)
  }

}
