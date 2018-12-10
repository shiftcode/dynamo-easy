import { Key, QueryInput, QueryOutput, ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { fetchAll } from '../../helper'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { and } from '../expression'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction, RequestConditionFunction } from '../expression/type'
import { getTableName } from '../get-table-name.function'
import { QueryRequest } from './query/query.request'
import { QueryResponse } from './query/query.response'
import { ScanRequest } from './scan/scan.request'
import { ScanResponse } from './scan/scan.response'
import { StandardRequest } from './standard.request'

export abstract class Request<
  T,
  R extends QueryRequest<T> | ScanRequest<T>,
  I extends QueryInput | ScanInput,
  Z extends QueryResponse<T> | ScanResponse<T>
> extends StandardRequest<T, I> {
  static DEFAULT_LIMIT = 10
  static INFINITE_LIMIT = -1

  readonly params: I

  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)

    this.params = <any>{
      TableName: getTableName(this.metadata),
    }

    this.limit(Request.DEFAULT_LIMIT)
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
      this.params.IndexName = indexName
    } else {
      throw new Error(`there is no index with name <${indexName}> defined for model ${this.modelClazz.name}`)
    }
    return <any>this
  }

  limit(limit: number): R {
    if (limit === Request.INFINITE_LIMIT) {
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

  // TODO TYPING how can we improve the typing to define the accepted value for condition function (see
  // update2.function)
  whereAttribute(attributePath: keyof T): RequestConditionFunction<R> {
    return addCondition('FilterExpression', <string>attributePath, <any>this, this.metadata)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('FilterExpression', condition, this.params)
    return <any>this
  }

  abstract execNoMap(): Observable<QueryOutput | ScanOutput>

  abstract execFullResponse(): Observable<Z>

  abstract exec(): Observable<T[]>

  abstract execSingle(): Observable<T | null>

  abstract execCount(): Observable<number>

  /**
   * fetches all pages. may uses all provisionedOutput, therefore for client side use cases rather use pagedDatasource (exec)
   */
  execFetchAll(): Observable<T[]> {
    return fetchAll(<R>(<any>this))
  }
}
