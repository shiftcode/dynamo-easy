import {
  DeleteItemInput,
  GetItemInput,
  PutItemInput,
  QueryInput,
  ScanInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { metadataForClass } from '../../decorator/metadata'
import { Metadata } from '../../decorator/metadata/metadata'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'

export abstract class BaseRequest<
  T,
  I extends DeleteItemInput | GetItemInput | PutItemInput | QueryInput | ScanInput | UpdateItemInput
> {
  readonly dynamoRx: DynamoRx
  readonly params: I
  readonly modelClazz: ModelConstructor<T>

  private metadata: Metadata<T>

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    this.dynamoRx = dynamoRx

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error("please provide the model clazz for the request, won't work otherwise")
    }

    this.modelClazz = modelClazz
    this.params = <I>{
      TableName: tableName,
    }
  }

  get metaData(): Metadata<T> {
    if (!this.metadata) {
      this.metadata = metadataForClass(this.modelClazz)
    }

    return this.metadata
  }

  abstract execFullResponse(): Observable<any>

  abstract exec(): Observable<T[] | T | null | void>
}
