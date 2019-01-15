import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { ModelConstructor } from '../../../model'
import { DynamoPromisified } from '../../dynamo-promisified'
import { addSortKeyCondition } from '../../expression/request-expression-builder'
import { SortKeyConditionFunction } from '../../expression/type'
import { ReadManyRequest } from '../read-many.request'
import { QueryResponse } from './query.response'

export class QueryRequest<T> extends ReadManyRequest<
  T,
  DynamoDB.QueryInput,
  DynamoDB.QueryOutput,
  QueryResponse<T>,
  QueryRequest<T>
> {
  protected readonly logger: Logger

  constructor(dynamoRx: DynamoPromisified, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.QueryRequest', modelClazz)
  }

  wherePartitionKey(partitionKeyValue: any): QueryRequest<T> {
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
   * @returns {SortKeyConditionFunction<QueryRequest<T>>}
   */
  whereSortKey(): SortKeyConditionFunction<QueryRequest<T>> {
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

  ascending(): QueryRequest<T> {
    this.params.ScanIndexForward = true
    return this
  }

  descending(): QueryRequest<T> {
    this.params.ScanIndexForward = false
    return this
  }

  protected doRequest(params: DynamoDB.QueryInput): Promise<DynamoDB.QueryOutput> {
    return this.dynamoRx.query(params)
  }
}
