import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { fetchAll } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { Mapper } from '../../../mapper/mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression/logical-operator/and.function'
import { ParamUtil } from '../../expression/param-util'
import { RequestExpressionBuilder } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { Pageable } from '../../paged/pageable'
import { Request } from '../request.model'
import { ScanResponse } from './scan.response'

export class ScanRequest<T> extends Request<T, ScanRequest<T>, ScanInput, ScanResponse<T>>
  implements Pageable<T, ScanRequest<T>, ScanResponse<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.ScanRequest', modelClazz)
  }

  whereAttribute(attributePath: keyof T): RequestConditionFunction<ScanRequest<T>> {
    return RequestExpressionBuilder.addCondition('FilterExpression', <string>attributePath, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): ScanRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metaData)
    ParamUtil.addExpression('FilterExpression', condition, this.params)
    return this
  }

  execFullResponse(): Observable<ScanResponse<T>> {
    delete this.params.Select

    this.logger.debug('request', this.params)
    return this.dynamoRx.scan(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(queryResponse => {
        const response: ScanResponse<T> = <any>{ ...queryResponse }
        response.Items = queryResponse.Items!.map(item => Mapper.fromDb(<Attributes>item, this.modelClazz))

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
      map(response => response.Items!.map(item => Mapper.fromDb(<Attributes>item, this.modelClazz))),
      tap(items => this.logger.debug('mapped items', items)),
    )
  }

  execSingle(): Observable<T | null> {
    delete this.params.Select
    this.logger.debug('single request', this.params)
    return this.dynamoRx.scan(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => Mapper.fromDb(<Attributes>response.Items![0], this.modelClazz)),
      tap(item => this.logger.debug('mapped item', item)),
    )
  }

  execCount(): Observable<number> {
    const params = { ...this.params }
    params.Select = 'COUNT'

    this.logger.debug('count request', params)
    return this.dynamoRx.scan(params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => response.Count!),
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
