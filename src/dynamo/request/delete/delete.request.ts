import {
  DeleteItemInput,
  DeleteItemOutput,
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
} from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { toDbOne } from '../../../mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression/logical-operator/and.function'
import { addExpression } from '../../expression/param-util'
import { addCondition } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { BaseRequest } from '../base.request'

export class DeleteRequest<T> extends BaseRequest<T, DeleteItemInput> {
  constructor(
    dynamoRx: DynamoRx,
    modelClazz: ModelConstructor<T>,
    tableName: string,
    partitionKey: any,
    sortKey?: any,
  ) {
    super(dynamoRx, modelClazz, tableName)

    const hasSortKey: boolean = this.metaData.getSortKey() !== null

    if (hasSortKey && (sortKey === null || sortKey === undefined)) {
      throw new Error(`please provide the sort key for attribute ${this.metaData.getSortKey()}`)
    }

    const keyAttributeMap: Attributes = {}

    // partition key
    const partitionKeyValue = toDbOne(partitionKey, this.metaData.forProperty(this.metaData.getPartitionKey()))

    if (partitionKeyValue === null) {
      throw new Error('please provide an acutal value for partition key, got null')
    }

    keyAttributeMap[<string>this.metaData.getPartitionKey()] = partitionKeyValue

    // sort key
    if (hasSortKey) {
      const sortKeyValue = toDbOne(sortKey, this.metaData.forProperty(<keyof T>this.metaData.getSortKey()))

      if (sortKeyValue === null) {
        throw new Error('please provide an actual value for sort key, got null')
      }

      keyAttributeMap[<string>this.metaData.getSortKey()] = sortKeyValue
    }

    this.params.Key = keyAttributeMap
  }

  whereAttribute(attributePath: keyof T): RequestConditionFunction<DeleteRequest<T>> {
    return addCondition('ConditionExpression', <string>attributePath, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): DeleteRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metaData)
    addExpression('ConditionExpression', condition, this.params)
    return this
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
    return this.dynamoRx.deleteItem(this.params).pipe(
      map(response => {
        return
      }),
    )
  }
}
