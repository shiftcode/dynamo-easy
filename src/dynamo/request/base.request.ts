import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { metadataForClass } from '../../decorator/metadata'
import { Metadata } from '../../decorator/metadata/metadata'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { getTableName } from '../get-table-name.function'

/**
 * Base Request for all Request classes usable with DynamoStore.
 * which means they have only one table they work with
 * (even if the actual operation would allow to use multiple tables. e.g. BatchWriteSingleTable)
 */
export abstract class BaseRequest<T,
  I extends DynamoDB.DeleteItemInput | DynamoDB.GetItemInput | DynamoDB.PutItemInput | DynamoDB.UpdateItemInput | DynamoDB.QueryInput | DynamoDB.ScanInput | DynamoDB.BatchGetItemInput |DynamoDB.BatchWriteItemInput | DynamoDB.TransactGetItemsInput | DynamoDB.TransactWriteItemsInput,
  R extends BaseRequest<T, I, any>> {
  readonly dynamoRx: DynamoRx
  readonly modelClazz: ModelConstructor<T>
  readonly metadata: Metadata<T>
  readonly tableName: string
  readonly params: I

  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    this.dynamoRx = dynamoRx

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error(`please provide the ModelConstructor for the request, won't work otherwise`)
    }
    this.modelClazz = modelClazz

    this.metadata = metadataForClass(this.modelClazz)

    if (!this.metadata.modelOptions) {
      throw new Error('given ModelConstructor has no @Model decorator')
    }

    this.tableName = getTableName(this.metadata)

    this.params = <I>{}
  }

  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): R {
    this.params.ReturnConsumedCapacity = level
    return <R><any>this
  }
}
