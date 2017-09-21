import {
  AttributeMap,
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
  ScanInput,
  UpdateItemInput,
  UpdateItemOutput,
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
import { Request } from '../request.model'

export class UpdateRequest<T> extends BaseRequest<T, any> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoRx, modelClazz)

    const hasSortKey: boolean = this.metaData.getSortKey() !== null

    if ((hasSortKey && sortKey === null) || sortKey === undefined) {
      throw new Error(`please provide the sort key for attribute ${this.metaData.getSortKey()}`)
    }

    const keyAttributeMap: AttributeMap = {}

    // partition key
    keyAttributeMap[this.metaData.getPartitionKey()] = Mapper.toDbOne(
      partitionKey,
      this.metaData.forProperty(this.metaData.getPartitionKey())
    )

    // sort key
    if (hasSortKey) {
      keyAttributeMap[this.metaData.getSortKey()!] = Mapper.toDbOne(
        sortKey!,
        this.metaData.forProperty(this.metaData.getSortKey()!)
      )
    }

    this.params.Key = keyAttributeMap
  }

  whereProperty(keyName: keyof T): RequestConditionFunction<UpdateRequest<T>> {
    return RequestExpressionBuilder.addCondition('FilterExpression', keyName, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): UpdateRequest<T> {
    const conditions: ConditionExpression[] = conditionDefFns.map(
      (conditionDefFn: ConditionExpressionDefinitionFunction) => {
        return conditionDefFn(undefined, this.metaData)
      }
    )

    const condition = and(...conditions)
    ParamUtil.addExpression('FilterExpression', condition, this.params)
    return this
  }

  // TODO implement http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html#DDB-UpdateItem-request-UpdateExpression
  updateExpression(expression: any): UpdateRequest<T> {
    return this
  }

  returnConsumedCapacity(level: ReturnConsumedCapacity): UpdateRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: ReturnItemCollectionMetrics): UpdateRequest<T> {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  /*
   * The ReturnValues parameter is used by several DynamoDB operations; however,
   * DeleteItem does not recognize any values other than NONE or ALL_OLD.
   */
  returnValues(returnValues: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW'): UpdateRequest<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  execFullResponse(): Observable<UpdateItemOutput> {
    return this.dynamoRx.updateItem(this.params)
  }

  exec(): Observable<void> {
    // TODO maybe we should map the returned Attributes to the given model type, needs some more investigation
    return this.dynamoRx.updateItem(this.params).map(response => {
      return
    })
  }
}
