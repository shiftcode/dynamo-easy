import { Key, QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { MetadataHelper } from '../decorator/metadata'
import { Mapper } from '../mapper/mapper'
import { ModelConstructor } from '../model/model-constructor'
import { Response } from './response.model'
import { AttributeMap } from '../../attribute-map.type'
import { DynamoRx } from '../dynamo/dynamo-rx'

export abstract class Request<T> {
  static DEFAULT_LIMIT = 10
  static INFINITE_LIMIT = -1

  protected readonly dynamoRx: DynamoRx
  protected readonly params: QueryInput | ScanInput
  protected readonly modelClazz: ModelConstructor<T>

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    this.dynamoRx = dynamoRx
    this.params = {
      TableName: MetadataHelper.get(modelClazz).modelOptions.tableName,
    }
    this.modelClazz = modelClazz
  }

  /**
   *
   * @param key A map representing the start id which is included in next call, if null is delivered
   * startKey will be removed from params
   * @returns {Request}
   */
  exclusiveStartKey(key: Key | null): Request<T> {
    if (key) {
      this.params.ExclusiveStartKey = key
    } else {
      delete this.params.ExclusiveStartKey
    }

    return this
  }

  mapFromDb(attributeMap: AttributeMap<T>): T {
    return Mapper.fromDb(attributeMap, this.modelClazz)
  }

  // TODO resolve remove old dynamo implementation
  // abstract where(keyName: string): ConditionFunction<Request<T>>;

  abstract limit(limit: number): Request<T>

  // abstract index(indexName: string): Request<T>;

  abstract execNoMap(): Observable<Response<T>>

  abstract exec(): Observable<T[]>

  abstract execSingle(): Observable<T | null>

  abstract execCount(): Observable<number>
}
