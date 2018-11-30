import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { fetchAll } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression'
import { addExpression } from '../../expression/param-util'
import { addCondition } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction, RequestConditionFunction } from '../../expression/type'
import { Request } from '../request.model'
import { ScanResponse } from './scan.response'

export class ScanRequest<T> extends Request<T, ScanRequest<T>, ScanInput, ScanResponse<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.ScanRequest', modelClazz)
  }

  whereAttribute(attributePath: keyof T): RequestConditionFunction<ScanRequest<T>> {
    return addCondition('FilterExpression', <string>attributePath, this, this.metadata)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): ScanRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('FilterExpression', condition, this.params)
    return this
  }

  execFullResponse(): Observable<ScanResponse<T>> {
    delete this.params.Select

    this.logger.debug('request', this.params)
    return this.dynamoRx.scan(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(queryResponse => {
        const response: ScanResponse<T> = <any>{ ...queryResponse }
        if (queryResponse.Items) {
          response.Items = queryResponse.Items.map(item => fromDb(<Attributes<T>>item, this.modelClazz))
        }
        return response
      }),
      tap(response => this.logger.debug('mapped items', response.Items)),
    )
  }

  execNoMap(): Observable<ScanOutput> {
    this.logger.debug('request (noMap)', this.params)
    return this.dynamoRx.scan(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  exec(): Observable<T[]> {
    delete this.params.Select
    this.logger.debug('request', this.params)
    return this.dynamoRx.scan(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => (response.Items || []).map(item => fromDb(<Attributes<T>>item, this.modelClazz))),
      tap(items => this.logger.debug('mapped items', items)),
    )
  }

  execSingle(): Observable<T | null> {
    delete this.params.Select
    this.logger.debug('single request', this.params)
    return this.dynamoRx.scan(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => {
        return response.Items && response.Items.length
          ? fromDb(<Attributes<T>>response.Items[0], this.modelClazz)
          : null
      }),
      tap(item => this.logger.debug('mapped item', item)),
    )
  }

  execCount(): Observable<number> {
    const params = { ...this.params }
    params.Select = 'COUNT'

    this.logger.debug('count request', params)
    return this.dynamoRx.scan(params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => response.Count || 0),
      tap(count => this.logger.debug('count', count)),
    )
  }

  /**
   * fetches all pages. may uses all provisionedOutput, therefore for client side use cases rather use pagedDatasource (exec)
   */
  execFetchAll(): Observable<T[]> {
    return fetchAll(this)
  }
}
