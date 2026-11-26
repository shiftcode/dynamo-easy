/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ModelConstructor } from '../../model/model-constructor'
import { getTableName } from '../get-table-name.function'
import { BaseRequest } from './base.request'

/**
 * abstract class for all requests types that operate on exactly one dynamo table.
 * basically just sets the TableName info on input params.
 */
export abstract class StandardRequest<
  T,
  T2,
  I extends
    | DynamoDB.DeleteItemInput
    | DynamoDB.GetItemInput
    | DynamoDB.PutItemInput
    | DynamoDB.UpdateItemInput
    | DynamoDB.QueryInput
    | DynamoDB.ScanInput,
  R extends StandardRequest<T, T2, I, any>,
> extends BaseRequest<T, T2, I, R> {
  protected constructor(client: DynamoDB.DynamoDBClient, modelClazz: ModelConstructor<T>) {
    super(client, modelClazz)
    this.params.TableName = getTableName(this.metadata)
  }
}
