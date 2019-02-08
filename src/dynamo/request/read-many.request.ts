import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { SecondaryIndex } from '../../decorator/impl/index/secondary-index'
import { fetchAll } from '../../helper/fetch-all.function'
import { promiseTap } from '../../helper/promise-tap.function'
import { Logger } from '../../logger/logger'
import { fromDb } from '../../mapper/mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { and } from '../expression/logical-operator/and.function'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import {
  RequestConditionFunction,
  RequestConditionFunctionTyped,
} from '../expression/type/condition-expression-definition-chain'
import { ConditionExpressionDefinitionFunction } from '../expression/type/condition-expression-definition-function'
import { QueryRequest } from './query/query.request'
import { QueryResponse } from './query/query.response'
import { ScanRequest } from './scan/scan.request'
import { ScanResponse } from './scan/scan.response'
import { StandardRequest } from './standard.request'

/**
 * abstract class for query and scan request classes.
 */
export abstract class ReadManyRequest<T,
  I extends DynamoDB.QueryInput | DynamoDB.ScanInput,
  O extends DynamoDB.QueryOutput | DynamoDB.ScanOutput,
  Z extends QueryResponse<T> | ScanResponse<T>,
  R extends QueryRequest<T> | ScanRequest<T>> extends StandardRequest<T, I, ReadManyRequest<T, I, O, Z, R>> {
  static DEFAULT_LIMIT = 10
  static INFINITE_LIMIT = -1

  protected secondaryIndex?: SecondaryIndex<T>

  protected abstract readonly logger: Logger

  /**
   * method that executes the actual call on dynamoDBWrapper with the given params.
   */
  protected abstract doRequest(params: I): Promise<O>

  protected constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>) {
    super(dynamoDBWrapper, modelClazz)
    this.limit(ReadManyRequest.DEFAULT_LIMIT)
  }

  /**
   *
   * @param key A map representing the start id which is included in next call, if null is delivered
   * startKey will be removed from params
   */
  exclusiveStartKey(key: DynamoDB.Key | null): R {
    // TODO ENHANCEMENT exclusiveStartKey(item: Partial<T>)
    if (key) {
      this.params.ExclusiveStartKey = key
    } else {
      delete this.params.ExclusiveStartKey
    }

    return <any>this
  }

  /**
   * query items on the given index.
   */
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

  /**
   * set Limit to params - The maximum number of items to evaluate (not necessarily the number of matching items)
   */
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

  /**
   * add a condition for propertyPath
   * @example req.whereAttribute('path.to.prop').eq('value')
   */
  whereAttribute<K extends keyof T>(attributePath: K): RequestConditionFunctionTyped<R, T, K>
  whereAttribute(attributePath: string): RequestConditionFunction<R, T>
  whereAttribute<K extends keyof T>(attributePath: string | K): RequestConditionFunction<R, T> | RequestConditionFunctionTyped<R, T, K> {
    return addCondition<R, T, any>('FilterExpression', attributePath, <any>this, this.metadata)
  }

  /**
   * add one or multiple conditions.
   * @example req.where( attribute('age').eq(23) )
   * @example req.where( or( attribute('age').lt(18), attribute('age').gt(65) ) )
   */
  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('FilterExpression', condition, this.params)
    return <any>this
  }

  /**
   * execute the request and return the raw response (without parsing the attributes to js objects)
   */
  execNoMap() {
    this.logger.debug('request (noMap)', this.params)
    return this.doRequest(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
  }

  /**
   * Execute with Limit: 1 to read the first item only
   */
  execSingle(): Promise<T | null> {
    // do not alter the params on the instance but add the additional 'Limit' param to a copy.
    // otherwise a follow-up request with the very same request-object would be wrong
    const params = {
      ...(<any>this.params),
      Limit: 1,
    }

    this.logger.debug('single request', params)
    return this.doRequest(params)
      .then(promiseTap(response => this.logger.debug('response', response)))
      .then(this.mapFromDb)
      .then(r => (r.Items && r.Items.length ? r.Items[0] : null))
      .then(promiseTap(item => this.logger.debug('mapped item', item)))

  }

  /**
   * Execute with Select: 'Count' to count the items.
   */
  execCount(): Promise<number> {
    // do not alter the params on the instance but add the additional 'Select' param to a copy.
    // otherwise a follow-up request with the very same request-object would be wrong
    const params = {
      ...(<any>this.params),
      Select: 'COUNT',
    }

    this.logger.debug('count request', params)
    return this.doRequest(params)
      .then(promiseTap(response => this.logger.debug('response', response)))
      .then(response => response.Count || 0)
      .then(promiseTap(count => this.logger.debug('count', count)))
  }

  /**
   * execute request and return the parsed items
   */
  exec(): Promise<T[]> {
    this.logger.debug('request', this.params)
    return this.doRequest(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
      .then(this.mapFromDb)
      .then(r => r.Items)
      .then(promiseTap(items => this.logger.debug('mapped items', items)))
  }

  /**
   * execute request and return the full response with the parsed items
   */
  execFullResponse(): Promise<Z> {
    this.logger.debug('request', this.params)
    return this.doRequest(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
      .then(this.mapFromDb)
      .then(promiseTap(response => this.logger.debug('mapped items', response.Items)))
  }

  /**
   * fetches all pages. may uses all provisionedOutput, therefore for client side use cases rather use pagedDatasource (exec)
   */
  execFetchAll(): Promise<T[]> {
    return fetchAll(<R>(<any>this))
  }

  protected mapFromDb = (output: O) => {
    const response: Z = { ...(<any>output) }
    response.Items = (output.Items || []).map(item => fromDb(<Attributes<T>>item, this.modelClazz))

    return response
  }
}
