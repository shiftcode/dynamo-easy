/**
 * @module store-requests
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Metadata } from '../../decorator/metadata/metadata'
import { metadataForModel } from '../../decorator/metadata/metadata-for-model.function'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { getTableName } from '../get-table-name.function'

/**
 * abstract class for all request classes usable with DynamoStore.
 * which means they have only one table they work with
 * (even if the actual operation would allow to use multiple tables. e.g. BatchWriteSingleTable)
 */
export abstract class BaseRequest<
  T,
  T2,
  I extends
    | DynamoDB.DeleteItemInput
    | DynamoDB.GetItemInput
    | DynamoDB.PutItemInput
    | DynamoDB.UpdateItemInput
    | DynamoDB.QueryInput
    | DynamoDB.ScanInput
    | DynamoDB.BatchGetItemInput
    | DynamoDB.BatchWriteItemInput
    | DynamoDB.TransactGetItemsInput
    | DynamoDB.TransactWriteItemsInput,
  R extends BaseRequest<T, T2, I, any>
> {
  readonly dynamoDBWrapper: DynamoDbWrapper

  /**
   * corresponding Model Class
   */
  readonly modelClazz: ModelConstructor<T>

  /**
   * metadata created from modelClazz
   */
  readonly metadata: Metadata<T>

  /**
   * tableName created with configured tableNameResolver function
   */
  readonly tableName: string

  /**
   * request input object
   */
  readonly params: I

  protected constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>) {
    this.dynamoDBWrapper = dynamoDBWrapper

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error(`please provide the ModelConstructor for the request, won't work otherwise`)
    }
    this.modelClazz = modelClazz

    this.metadata = metadataForModel(this.modelClazz)

    if (!this.metadata.modelOptions) {
      throw new Error('given ModelConstructor has no @Model decorator')
    }

    this.tableName = getTableName(this.metadata)

    this.params = <I>{}
  }

  /**
   * return ConsumedCapacity of the corresponding table(s) in the response
   * @param level not all requests support all values
   */
  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): R {
    this.params.ReturnConsumedCapacity = level
    return <R>(<any>this)
  }

  /**
   * execute request and return the full response of dynamoDB. read items will be parsed to JS objects.
   */
  abstract execFullResponse(): Promise<any>

  /**
   * execute request and return the parsed item(s) or void if none were requested.
   */
  abstract exec(): Promise<T2 | T2[] | void | null>
}
