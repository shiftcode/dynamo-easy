import {
  AttributeMap,
  DeleteItemInput,
  DeleteItemOutput,
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
import { ParamUtil } from '../../expression/param-util'
import { Condition } from '../../expression/type/condition.type'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { BaseRequest } from '../base.request'

export class DeleteRequest<T> extends BaseRequest<T, DeleteItemInput> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoRx, modelClazz)

    const hasSortKey: boolean = this.metaData.getSortKey() !== null

    if (hasSortKey && (sortKey === null || sortKey === undefined)) {
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

  where(keyName: keyof T): RequestConditionFunction<DeleteRequest<T>>

  /**
   * multiple conditions will be combined using the AND operator by default
   * @param {Condition[]} conditions
   * @returns {QueryRequest<T>}
   */
  where(conditions: Condition[]): DeleteRequest<T>

  where(args: any): any {
    if (Array.isArray(args)) {
      const condition = and(...args)
      ParamUtil.addConditionExpression(condition, this.params)
      return this
    } else {
      const keyName = args
      return ConditionBuilder.addCondition(keyName, this)
    }
  }

  returnConsumedCapacity(level: ReturnConsumedCapacity): DeleteRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: ReturnItemCollectionMetrics): DeleteRequest<T> {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  /*
     * The ReturnValues parameter is used by several DynamoDB operations; however,
     * DeleteItem does not recognize any values other than NONE or ALL_OLD.
     */
  returnValues(returnValues: 'NONE' | 'ALL_OLD'): DeleteRequest<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  execFullResponse(): Observable<DeleteItemOutput> {
    return this.dynamoRx.deleteItem(this.params)
  }

  exec(): Observable<void> {
    return this.dynamoRx.deleteItem(this.params).map(response => {
      return
    })
  }
}
