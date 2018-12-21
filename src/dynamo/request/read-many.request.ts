import { Key, QueryInput, QueryOutput, ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { SecondaryIndex } from '../../decorator/impl'
import { fetchAll } from '../../helper'
import { Logger } from '../../logger/logger'
import { Attributes, fromDb } from '../../mapper'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { and, RequestConditionFunction } from '../expression'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../expression/type'
import { QueryRequest } from './query/query.request'
import { QueryResponse } from './query/query.response'
import { ScanRequest } from './scan/scan.request'
import { ScanResponse } from './scan/scan.response'
import { StandardRequest } from './standard.request'

/**
 * Base class for query and scan request classes.
 */
export abstract class ReadManyRequest<T,
  I extends QueryInput | ScanInput,
  O extends QueryOutput | ScanOutput,
  Z extends QueryResponse<T> | ScanResponse<T>,
  R extends QueryRequest<T> | ScanRequest<T>> extends StandardRequest<T, I, ReadManyRequest<T, I, O, Z, R>> {
  static DEFAULT_LIMIT = 10
  static INFINITE_LIMIT = -1

  protected secondaryIndex?: SecondaryIndex<T>

  protected abstract readonly logger: Logger

  /**
   * method that executes the actual call on dynamoRx with the given params.
   * @param params
   */
  protected abstract doRequest(params: I): Observable<O>

  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.limit(ReadManyRequest.DEFAULT_LIMIT)
  }

  /**
   *
   * @param key A map representing the start id which is included in next call, if null is delivered
   * startKey will be removed from params
   * @returns {Request}
   */
  exclusiveStartKey(key: Key | null): R {
    if (key) {
      this.params.ExclusiveStartKey = key
    } else {
      delete this.params.ExclusiveStartKey
    }

    return <any>this
  }

  index(indexName: string): R {
    const index = this.metadata.getIndex(indexName)

    if (index) {
      this.secondaryIndex = index
      this.params.IndexName = indexName
    } else {
      throw new Error(`there is no index with name <${indexName}> defined for model ${this.modelClazz.name}`)
    }
    return <any>this
  }

  limit(limit: number): R {
    if (limit === ReadManyRequest.INFINITE_LIMIT) {
      delete this.params.Limit
    } else {
      if (limit !== null && limit !== undefined && limit > 0) {
        this.params.Limit = limit
      } else {
        throw new Error('limit must be a valid positive number')
      }
    }

    return <any>this
  }

  whereAttribute<K extends keyof T>(attributePath: K): RequestConditionFunction<R, T, K> {
    return addCondition('FilterExpression', attributePath, <any>this, this.metadata)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('FilterExpression', condition, this.params)
    return <any>this
  }

  execNoMap(): Observable<O> {
    this.logger.debug('request (noMap)', this.params)
    return this.doRequest(this.params)
      .pipe(tap(response => this.logger.debug('response', response)))
  }

  execSingle(): Observable<T | null> {
    // do not alter the params on the instance but add the additional 'Limit' param to a copy.
    // otherwise a follow-up request with the very same request-object would be wrong
    const params = {
      ...<any>this.params,
      Limit: 1,
    }

    this.logger.debug('single request', params)
    return this.doRequest(params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(this.mapFromDb),
      map(r => r.Items && r.Items.length ? r.Items[0] : null),
      tap(item => this.logger.debug('mapped item', item)),
    )
  }

  execCount(): Observable<number> {
    // do not alter the params on the instance but add the additional 'Limit' param to a copy.
    // otherwise a follow-up request with the very same request-object would be wrong
    const params = {
      ...<any>this.params,
      Select: 'COUNT',
    }

    this.logger.debug('count request', params)
    return this.doRequest(params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => response.Count || 0),
      tap(count => this.logger.debug('count', count)),
    )
  }

  exec(): Observable<T[]> {
    this.logger.debug('request', this.params)
    return this.doRequest(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(this.mapFromDb),
      map(r => r.Items),
      tap(items => this.logger.debug('mapped items', items)),
    )
  }

  execFullResponse(): Observable<Z> {
    this.logger.debug('request', this.params)
    return this.doRequest(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(this.mapFromDb),
      tap(response => this.logger.debug('mapped items', response.Items)),
    )
  }

  /**
   * fetches all pages. may uses all provisionedOutput, therefore for client side use cases rather use pagedDatasource (exec)
   */
  execFetchAll(): Observable<T[]> {
    return fetchAll(<R>(<any>this))
  }

  protected mapFromDb = (output: O) => {
    const response: Z = { ...<any>output }
    response.Items = (output.Items || []).map(item => fromDb(<Attributes<T>>item, this.modelClazz))

    return response
  }
}
