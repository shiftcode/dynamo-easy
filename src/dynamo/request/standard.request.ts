import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { getTableName } from '../get-table-name.function'
import { BaseRequest } from './base.request'

/**
 * base class for all requests types that operate on exactly one dynamo table.
 * basically just sets the TableName info on input params.
 */
export abstract class StandardRequest<
  T,
  I extends
    | DynamoDB.DeleteItemInput
    | DynamoDB.GetItemInput
    | DynamoDB.PutItemInput
    | DynamoDB.UpdateItemInput
    | DynamoDB.QueryInput
    | DynamoDB.ScanInput,
  R extends StandardRequest<T, I, any>
> extends BaseRequest<T, I, R> {
  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.params.TableName = getTableName(this.metadata)
  }

  abstract execFullResponse(): Promise<any>

  abstract exec(): Promise<T[] | T | null | void>
}
