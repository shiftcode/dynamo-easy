import { Key, QueryInput, QueryOutput, ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { BaseRequest } from './base.request'
import { QueryRequest } from './query/query.request'
import { QueryResponse } from './query/query.response'
import { ScanRequest } from './scan/scan.request'
import { ScanResponse } from './scan/scan.response'

export abstract class Request<
  T,
  R extends QueryRequest<T> | ScanRequest<T>,
  I extends QueryInput | ScanInput,
  Z extends QueryResponse<T> | ScanResponse<T>
> extends BaseRequest<T, I> {
  static DEFAULT_LIMIT = 10
  static INFINITE_LIMIT = -1

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
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

  abstract execFullResponse(): Observable<Z>

  abstract execNoMap(): Observable<QueryOutput | ScanOutput>

  abstract exec(): Observable<T[]>

  abstract execSingle(): Observable<T | null>

  abstract execCount(): Observable<number>
}
