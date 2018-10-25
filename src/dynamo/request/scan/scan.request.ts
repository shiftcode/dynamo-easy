import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
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
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
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

    return this.dynamoRx.scan(this.params).pipe(
      map(queryResponse => {
        const response: ScanResponse<T> = <any>{ ...queryResponse }
        response.Items = queryResponse.Items!.map(item => Mapper.fromDb(<Attributes>item, this.modelClazz))

        return response
      })
    )
  }

  execNoMap(): Observable<ScanOutput> {
    return this.dynamoRx.scan(this.params)
  }

  exec(): Observable<T[]> {
    delete this.params.Select

    return this.dynamoRx
      .scan(this.params)
      .pipe(map(response => response.Items!.map(item => Mapper.fromDb(<Attributes>item, this.modelClazz))))
  }

  execSingle(): Observable<T | null> {
    delete this.params.Select

    return this.dynamoRx
      .scan(this.params)
      .pipe(map(response => Mapper.fromDb(<Attributes>response.Items![0], this.modelClazz)))
  }

  execCount(): Observable<number> {
    const params = { ...this.params }
    params.Select = 'COUNT'

    return this.dynamoRx.scan(params).pipe(map(response => response.Count!))
  }
}
