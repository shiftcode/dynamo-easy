import {
  AttributeMap,
  GetItemInput,
  PutItemInput,
  PutItemOutput,
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
} from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { Metadata } from '../../../decorator/metadata/metadata'
import { MetadataHelper } from '../../../decorator/metadata/metadata-helper'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression/logical-operator/and.function'
import { ParamUtil } from '../../expression/param-util'
import { RequestExpressionBuilder } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { ConditionExpression } from '../../expression/type/condition-expression.type'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { BaseRequest } from '../base.request'

export class PutRequest<T> extends BaseRequest<T, any> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, item: T) {
    super(dynamoRx, modelClazz)
    this.params.Item = Mapper.toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @returns {PutRequest<T>}
   */
  ifNotExists(): PutRequest<T> {
    // FIXME should we check for sort key too?
    this.whereProperty(this.metaData.getPartitionKey()).null()
    return this
  }

  returnConsumedCapacity(level: ReturnConsumedCapacity): PutRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: ReturnItemCollectionMetrics): PutRequest<T> {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  /*
   * The ReturnValues parameter is used by several DynamoDB operations,
   * however, PutItem does not recognize any values other than NONE or ALL_OLD.
   */
  returnValues(returnValues: 'NONE' | 'ALL_OLD'): PutRequest<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  whereProperty(keyName: keyof T): RequestConditionFunction<PutRequest<T>> {
    return RequestExpressionBuilder.addCondition(keyName, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): PutRequest<T> {
    const conditions: ConditionExpression[] = conditionDefFns.map(
      (conditionDefFn: ConditionExpressionDefinitionFunction) => {
        return conditionDefFn(undefined, this.metaData)
      }
    )

    const condition = and(...conditions)
    ParamUtil.addExpression('ConditionExpression', condition, this.params)
    return this
  }

  execFullResponse(): Observable<PutItemOutput> {
    return this.dynamoRx.putItem(this.params)
  }

  exec(): Observable<void> {
    return this.dynamoRx.putItem(this.params).map(response => {
      return
    })
  }
}
