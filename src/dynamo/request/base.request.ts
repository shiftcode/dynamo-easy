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
  readonly modelClazz: ModelConstructor<T>
  readonly metadata: Metadata<T>
  readonly abstract params: I

  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    this.dynamoRx = dynamoRx

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error("please provide the model clazz for the request, won't work otherwise")
    }

    this.modelClazz = modelClazz
    this.metadata = metadataForClass(this.modelClazz)
  }

  abstract execFullResponse(): Observable<any>
  abstract exec(): Observable<T[] | T | null | void>
}
