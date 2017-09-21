import {
  AttributeMap,
  DeleteItemInput,
  GetItemInput,
  Key,
  PutItemInput,
  QueryInput,
  ScanInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { Metadata } from '../../decorator/metadata/metadata'
import { MetadataHelper } from '../../decorator/metadata/metadata-helper'
import { Mapper } from '../../mapper/mapper'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { PutRequest } from './put/put.request'

export abstract class BaseRequest<
  T,
  I extends DeleteItemInput | GetItemInput | PutItemInput | QueryInput | ScanInput | UpdateItemInput
> {
  readonly dynamoRx: DynamoRx
  readonly params: I
  readonly modelClazz: ModelConstructor<T>

  private _metadata: Metadata<T>

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    this.dynamoRx = dynamoRx

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error("please provide the model clazz for the request, won't work otherwise")
    }

    this.modelClazz = modelClazz
    this.params = <I>{
      TableName: MetadataHelper.forModel(modelClazz).tableName,
    }
  }

  get metaData(): Metadata<T> {
    if (!this._metadata) {
      this._metadata = MetadataHelper.get(this.modelClazz)
    }

    return this._metadata
  }

  abstract execFullResponse(): Observable<any>

  abstract exec(): Observable<T[] | T | null | void>
}
