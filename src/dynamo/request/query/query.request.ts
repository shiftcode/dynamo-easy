import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { addSortKeyCondition } from '../../expression/request-expression-builder'
import { RequestSortKeyConditionFunction } from '../../expression/type'
import { Request } from '../request.model'
import { QueryResponse } from './query.response'

export class QueryRequest<T> extends Request<T, QueryRequest<T>, QueryInput, QueryResponse<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.QueryRequest', modelClazz)
  }

  private mapFromDb = (queryResponse: QueryOutput) => {
    const response: QueryResponse<T> = <any>{ ...queryResponse }
    response.Items = (queryResponse.Items || []).map(item => fromDb(<Attributes<T>>item, this.modelClazz))

    return response
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
  whereSortKey(): RequestSortKeyConditionFunction<QueryRequest<T>> {
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

  ascending(): QueryRequest<T> {
    this.params.ScanIndexForward = true
    return this
  }

  descending(): QueryRequest<T> {
    this.params.ScanIndexForward = false
    return this
  }

  execNoMap(): Observable<QueryOutput> {
    this.logger.debug('request (noMap)', this.params)
    return this.dynamoRx.query(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  execFullResponse(): Observable<QueryResponse<T>> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.query(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(this.mapFromDb),
      tap(response => this.logger.debug('mapped items', response.Items)),
    )
  }

  exec(): Observable<T[]> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.query(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(this.mapFromDb),
      map(r => r.Items),
      tap(items => this.logger.debug('mapped items', items)),
    )
  }

  execSingle(): Observable<T | null> {
    const params = {
      ...this.params,
      Limit: 1
    }

    this.logger.debug('single request', params)
    return this.dynamoRx.query(params)
      .pipe(
        tap(response => this.logger.debug('response', response)),
        map(this.mapFromDb),
        map(r => r.Items && r.Items.length ? r.Items[0] : null),
        tap(item => this.logger.debug('mapped item', item)),
      )
  }

  execCount(): Observable<number> {
    const params = {
      ...this.params,
      Select: 'COUNT',
    }

    this.logger.debug('count request', params)
    return this.dynamoRx.query(params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => response.Count || 0),
      tap(count => this.logger.debug('count', count)),
    )
  }

}
