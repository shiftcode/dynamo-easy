import { AttributeMap, Key, QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { Metadata } from '../decorator/metadata'
import { MetadataHelper } from '../decorator/metadata-helper'
import { DynamoRx } from '../dynamo/dynamo-rx'
import { Mapper } from '../mapper/mapper'
import { ModelConstructor } from '../model/model-constructor'
import { Response } from './response.model'

export abstract class Request<T, P extends QueryInput | ScanInput> {
  static DEFAULT_LIMIT = 10
  static INFINITE_LIMIT = -1

  readonly dynamoRx: DynamoRx
  readonly params: P
  readonly modelClazz: ModelConstructor<T>

  private _metadata: Metadata<T>

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    this.dynamoRx = dynamoRx
    this.modelClazz = modelClazz
    this.params = <P>{
      TableName: MetadataHelper.forModel(modelClazz).tableName,
    }
    this.limit(Request.DEFAULT_LIMIT)
  }

  get metaData(): Metadata<T> {
    if (!this._metadata) {
      this._metadata = MetadataHelper.get(this.modelClazz)
    }

    return this._metadata
  }

  /**
   *
   * @param key A map representing the start id which is included in next call, if null is delivered
   * startKey will be removed from params
   * @returns {Request}
   */
  exclusiveStartKey(key: Key | null): Request<T, P> {
    if (key) {
      this.params.ExclusiveStartKey = key
    } else {
      delete this.params.ExclusiveStartKey
    }

    return this
  }

  index(indexName: string): Request<T, P> {
    const index = this.metaData.getIndex(indexName)

    if (index) {
      this.params.IndexName = indexName
    } else {
      throw new Error(`there is no index with name <${indexName}> defined for model ${this.modelClazz.name}`)
    }
    return this
  }

  mapFromDb(attributeMap: AttributeMap): T {
    return Mapper.fromDb(attributeMap, this.modelClazz)
  }

  // TODO resolve remove old dynamo implementation
  // abstract where(keyName: string): ConditionFunction<Request<T>>;

  limit(limit: number): Request<T, P> {
    if (limit === Request.INFINITE_LIMIT) {
      delete this.params.Limit
    } else {
      if (limit !== null && limit !== undefined) {
        this.params.Limit = limit
      } else {
        throw new Error('limit must be a valid number')
      }
    }

    return this
  }

  abstract execNoMap(): Observable<Response<T>>

  abstract exec(): Observable<T[]>

  abstract execSingle(): Observable<T | null>

  abstract execCount(): Observable<number>
}
