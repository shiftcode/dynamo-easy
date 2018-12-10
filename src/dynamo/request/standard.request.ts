import {
  DeleteItemInput,
  GetItemInput,
  PutItemInput,
  QueryInput,
  ScanInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { getTableName } from '../get-table-name.function'
import { BaseRequest } from './base.request'

export abstract class StandardRequest<
  T,
  I extends DeleteItemInput | GetItemInput | PutItemInput | QueryInput | ScanInput | UpdateItemInput
> extends BaseRequest<T, I> {
  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.params.TableName = getTableName(this.metadata)
  }

  abstract execFullResponse(): Observable<any>

  abstract exec(): Observable<T[] | T | null | void>
}
