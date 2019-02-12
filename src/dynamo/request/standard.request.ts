/**
 * @module store-requests
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { getTableName } from '../get-table-name.function'
import { BaseRequest } from './base.request'

/**
 * abstract class for all requests types that operate on exactly one dynamo table.
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
  protected constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>) {
    super(dynamoDBWrapper, modelClazz)
    this.params.TableName = getTableName(this.metadata)
  }
}
