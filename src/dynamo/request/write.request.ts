import {
  DeleteItemInput,
  PutItemInput,
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb'
import { ModelConstructor } from '../../model'
import { DynamoRx } from '../dynamo-rx'
import { and } from '../expression/logical-operator'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction, RequestConditionFunction } from '../expression/type'
import { BaseRequest } from './base.request'

export abstract class WriteRequest<
  R extends BaseRequest<T, I>,
  T,
  I extends DeleteItemInput | PutItemInput | UpdateItemInput
> extends BaseRequest<T, I> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
  }

  returnConsumedCapacity(level: ReturnConsumedCapacity): R {
    this.params.ReturnConsumedCapacity = level
    return <R>(<any>this)
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: ReturnItemCollectionMetrics): R {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return <R>(<any>this)
  }

  onlyIfAttribute(attributePath: keyof T): RequestConditionFunction<R> {
    return addCondition('ConditionExpression', <string>attributePath, <R>(<any>this), this.metadata)
  }

  /**
   * @param conditionDefFns
   */
  onlyIf(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('ConditionExpression', condition, this.params)
    return <R>(<any>this)
  }

  /*
   * The ReturnValues parameter is used by several DynamoDB operations; however,
   * DeleteItem/PutItem/UpdateItem does not recognize any values other than NONE or ALL_OLD.
   */
  returnValues(returnValues: 'NONE' | 'ALL_OLD'): R {
    this.params.ReturnValues = returnValues
    return <R>(<any>this)
  }
}
