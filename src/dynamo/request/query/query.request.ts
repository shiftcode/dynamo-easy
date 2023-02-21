/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { addSortKeyCondition } from '../../expression/request-expression-builder'
import { SortKeyConditionFunction } from '../../expression/type/sort-key-condition-function'
import { ReadManyRequest } from '../read-many.request'
import { QueryResponse } from './query.response'

/**
 * Request class for the Query operation.
 */
export class QueryRequest<T, T2 = T> extends ReadManyRequest<
  T,
  T2,
  DynamoDB.QueryInput,
  DynamoDB.QueryOutput,
  QueryResponse<T2>,
  QueryRequest<T, T2>,
  QueryRequest<T, Partial<T>>
> {
  protected readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.QueryRequest', modelClazz)
  }

  wherePartitionKey(partitionKeyValue: any): this {
    let partitionKey: keyof T
    if (this.secondaryIndex) {
      if (!this.secondaryIndex.partitionKey) {
        throw new Error(`there is no partition key defined for index '${this.params.IndexName}'`)
      }
      partitionKey = this.secondaryIndex.partitionKey
    } else {
      partitionKey = this.metadata.getPartitionKey()
    }

    return addSortKeyCondition(partitionKey, this, this.metadata).equals(partitionKeyValue)
  }

  /**
   * used to define some condition for the sort key, use the secondary index to query based on a custom index
   */
  whereSortKey(): SortKeyConditionFunction<this> {
    let sortKey: keyof T | null
    if (this.secondaryIndex) {
      if (!this.secondaryIndex.sortKey) {
        throw new Error(`there is no sort key defined for index '${this.params.IndexName}'`)
      }
      sortKey = this.secondaryIndex.sortKey
    } else {
      sortKey = this.metadata.getSortKey()
    }

    if (!sortKey) {
      throw new Error('There was no sort key defined for current schema')
    }

    return addSortKeyCondition(sortKey, this, this.metadata)
  }

  ascending(): this {
    this.params.ScanIndexForward = true
    return this
  }

  descending(): this {
    this.params.ScanIndexForward = false
    return this
  }

  protected doRequest(params: DynamoDB.QueryInput): Promise<DynamoDB.QueryOutput> {
    return this.dynamoDBWrapper.query(params)
  }
}
