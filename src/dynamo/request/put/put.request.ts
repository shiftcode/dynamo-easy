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
import { ConditionBuilder } from '../../expression/condition-builder'
import { and } from '../../expression/logical-operator/and'
import { ConditionDefFn } from '../../expression/logical-operator/property'
import { ParamUtil } from '../../expression/param-util'
import { Condition } from '../../expression/type/condition.type'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { BaseRequest } from '../base.request'

export class PutRequest<T> extends BaseRequest<any, any> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, item: T) {
    super(dynamoRx, modelClazz)
    this.params.Item = Mapper.toDb(item, this.modelClazz)
  }

  // TODO implement this
  conditionExpression(condition: any): PutRequest<T> {
    this.params.ConditionExpression = condition
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
    return ConditionBuilder.addCondition(keyName, this, this.metaData)
  }

  where(...conditionDefFns: ConditionDefFn[]): PutRequest<T> {
    const conditions: Condition[] = conditionDefFns.map((conditionDefFn: ConditionDefFn) => {
      return conditionDefFn(undefined, this.metaData)
    })

    const condition = and(...conditions)
    ParamUtil.addConditionExpression(condition, this.params)
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
