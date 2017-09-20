import { ScanInput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { ConditionBuilder } from '../../expression/condition-builder'
import { and } from '../../expression/logical-operator/and'
import { ParamUtil } from '../../expression/param-util'
import { Condition } from '../../expression/type/condition.type'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { Request } from '../request.model'
import { ScanResponse } from './scan.response'

export class ScanRequest<T> extends Request<T, ScanRequest<T>, ScanInput, ScanResponse<T>> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
  }

  where(keyName: keyof T): RequestConditionFunction<ScanRequest<T>>

  /**
   * multiple conditions will be combined using the AND operator by default
   * @param {Condition[]} conditions
   * @returns {QueryRequest<T>}
   */
  where(conditions: Condition[]): ScanRequest<T>

  where(args: any): any {
    if (Array.isArray(args)) {
      const condition = and(...args)
      ParamUtil.addFilterExpression(condition, this.params)
      return this
    } else {
      const keyName = args
      return ConditionBuilder.addCondition(keyName, this)
    }
  }

  execFullResponse(): Observable<ScanResponse<T>> {
    delete this.params.Select

    return this.dynamoRx.scan(this.params).map(queryResponse => {
      const response: ScanResponse<T> = <any>{ ...queryResponse }
      response.Items = queryResponse.Items!.map(item => Mapper.fromDb(item, this.modelClazz))

      return response
    })
  }

  exec(): Observable<T[]> {
    delete this.params.Select

    return this.dynamoRx
      .scan(this.params)
      .map(response => response.Items!.map(item => Mapper.fromDb(item, this.modelClazz)))
  }

  execSingle(): Observable<T | null> {
    delete this.params.Select

    return this.dynamoRx.scan(this.params).map(response => Mapper.fromDb(response.Items![0], this.modelClazz))
  }

  execCount(): Observable<number> {
    const params = { ...this.params }
    params.Select = 'COUNT'

    return this.dynamoRx.scan(params).map(response => response.Count!)
  }
}
