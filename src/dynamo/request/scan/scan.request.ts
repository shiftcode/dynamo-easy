import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { fetchAll } from '../../../helper'
import { Attributes, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression'
import { addExpression } from '../../expression/param-util'
import { addCondition } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { Pageable } from '../../paged'
import { Request } from '../request.model'
import { ScanResponse } from './scan.response'

export class ScanRequest<T> extends Request<T, ScanRequest<T>, ScanInput, ScanResponse<T>>
  implements Pageable<T, ScanRequest<T>, ScanResponse<T>> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
  }

  whereAttribute(attributePath: keyof T): RequestConditionFunction<ScanRequest<T>> {
    return addCondition('FilterExpression', <string>attributePath, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): ScanRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metaData)
    addExpression('FilterExpression', condition, this.params)
    return this
  }

  execFullResponse(): Observable<ScanResponse<T>> {
    delete this.params.Select

    return this.dynamoRx.scan(this.params).pipe(
      map(queryResponse => {
        const response: ScanResponse<T> = <any>{ ...queryResponse }
        if (queryResponse.Items) {
          response.Items = queryResponse.Items.map(item => fromDb(<Attributes>item, this.modelClazz))
        }
        return response
      }),
    )
  }

  execNoMap(): Observable<ScanOutput> {
    return this.dynamoRx.scan(this.params)
  }

  exec(): Observable<T[]> {
    delete this.params.Select

    return this.dynamoRx
      .scan(this.params)
      .pipe(map(response => (response.Items || []).map(item => fromDb(<Attributes>item, this.modelClazz))))
  }

  execSingle(): Observable<T | null> {
    delete this.params.Select

    return this.dynamoRx
      .scan(this.params)
      .pipe(
        map(response =>
          response.Items && response.Items.length ? fromDb(<Attributes>response.Items[0], this.modelClazz) : null,
        ),
      )
  }

  execCount(): Observable<number> {
    const params = { ...this.params }
    params.Select = 'COUNT'

    return this.dynamoRx.scan(params).pipe(map(response => response.Count || 0))
  }

  /**
   * fetches all pages. may uses all provisionedOutput, therefore for client side use cases rather use pagedDatasource (exec)
   */
  execFetchAll(): Observable<T[]> {
    return fetchAll(this)
  }
}
