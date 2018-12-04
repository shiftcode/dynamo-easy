import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { fetchAll } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression'
import { addExpression } from '../../expression/param-util'
import { addCondition, addSortKeyCondition } from '../../expression/request-expression-builder'
import {
  ConditionExpressionDefinitionFunction,
  RequestConditionFunction,
} from '../../expression/type'
import { SortKeyConditionFunction } from '../../expression/type'
import { Request } from '../request.model'
import { QueryResponse } from './query.response'

export class QueryRequest<T> extends Request<T, QueryRequest<T>, QueryInput, QueryResponse<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.QueryRequest', modelClazz)
  }

  wherePartitionKey(partitionKeyValue: any): QueryRequest<T> {
    let partitionKey: keyof T
    if (this.params.IndexName) {
      const index = this.metadata.getIndex(this.params.IndexName)
      if (index) {
        partitionKey = index.partitionKey
        if (!partitionKey) {
          throw new Error(`there is no parition key defined for index <${this.params.IndexName}>`)
        }
      } else {
        throw new Error(`the index <${this.params.IndexName}> does not exist on model ${this.modelClazz.name}`)
      }
    } else {
      partitionKey = this.metadata.getPartitionKey()
    }

    return addSortKeyCondition(partitionKey, this, this.metadata).equals(partitionKeyValue)
  }

  /**
   * used to define some condition for the sort key, use the secondary index to query based on a custom index
   * @returns {RequestConditionFunction<T>}
   */
  whereSortKey(): SortKeyConditionFunction<QueryRequest<T>> {
    let sortKey: keyof T | null
    if (this.params.IndexName) {
      const index = this.metadata.getIndex(this.params.IndexName)
      if (index) {
        if (index.sortKey) {
          sortKey = index.sortKey
        } else {
          throw new Error(`there is no sort key defined for index <${this.params.IndexName}>`)
        }
      } else {
        throw new Error(`the index <${this.params.IndexName}> does not exist on model ${this.modelClazz.name}`)
      }
    } else {
      sortKey = this.metadata.getSortKey()
    }

    if (!sortKey) {
      throw new Error('There was no sort key defined for current schema')
    }

    return addSortKeyCondition(sortKey, this, this.metadata)
  }

  // TODO TYPING how can we improve the typing to define the accepted value for condition function (see
  // update2.function)
  whereAttribute(attributePath: keyof T): RequestConditionFunction<QueryRequest<T>> {
    return addCondition('FilterExpression', <string>attributePath, this, this.metadata)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): QueryRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('FilterExpression', condition, this.params)
    return this
  }

  ascending(): QueryRequest<T> {
    this.params.ScanIndexForward = true
    return this
  }

  descending(): QueryRequest<T> {
    this.params.ScanIndexForward = false
    return this
  }

  execCount(): Observable<number> {
    const params = { ...this.params }
    params.Select = 'COUNT'

    this.logger.debug('count request', params)
    return this.dynamoRx.query(params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => response.Count || 0),
      tap(count => this.logger.debug('count', count)),
    )
  }

  execFullResponse(): Observable<QueryResponse<T>> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.query(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(queryResponse => {
        const response: QueryResponse<T> = <any>{ ...queryResponse }
        response.Items = (queryResponse.Items || []).map(item => fromDb(<Attributes<T>>item, this.modelClazz))

        return response
      }),
      tap(response => this.logger.debug('mapped items', response.Items)),
    )
  }

  exec(): Observable<T[]> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.query(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => (response.Items || []).map(item => fromDb(<Attributes<T>>item, this.modelClazz))),
      tap(items => this.logger.debug('mapped items', items)),
    )
  }

  execNoMap(): Observable<QueryOutput> {
    this.logger.debug('request (noMap)', this.params)
    return this.dynamoRx.query(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  execSingle(): Observable<T | null> {
    // fixme, copy params, don't add limit on member (too implicit, --> request instance can't be reused to fetch many)
    this.limit(1)
    this.logger.debug('single request', this.params)
    return this.dynamoRx.query(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => {
        return response.Items && response.Items.length
          ? fromDb(<Attributes<T>>response.Items[0], this.modelClazz)
          : null
      }),
      tap(item => this.logger.debug('mapped item', item)),
    )
  }

  /**
   * fetches all pages. may uses all provisionedOutput, therefore for client side use cases rather use pagedDatasource (exec)
   */
  execFetchAll(): Observable<T[]> {
    return fetchAll(this)
  }
}
