/**
 * @module multi-model-requests/transact-get
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { metadataForModel } from '../../decorator/metadata/metadata-for-model.function'
import { createToKeyFn, fromDb } from '../../mapper/mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { getTableName } from '../get-table-name.function'
import { TransactGetFullResponse } from './transact-get-full.response'
import { TransactGetRequest1 } from './transact-get.request.type'
/**
 * max count of request items allowed by aws
 */
const MAX_REQUEST_ITEM_COUNT = 10

/**
 * Request class for the TransactGetItems operation. Read up to 10 items from one or more tables in a transaction.
 */
export class TransactGetRequest {
  get dynamoDB(): DynamoDB.DynamoDB {
    return this.dynamoDBWrapper.dynamoDB
  }

  readonly params: DynamoDB.TransactGetItemsInput & {
    TransactItems: NonNullable<DynamoDB.TransactGetItemsInput['TransactItems']>
  }
  private readonly dynamoDBWrapper: DynamoDbWrapper
  private readonly tables: Array<ModelConstructor<any>> = []

  constructor(dynamoDB: DynamoDB.DynamoDB) {
    this.dynamoDBWrapper = new DynamoDbWrapper(dynamoDB)
    this.params = {
      TransactItems: [],
    }
  }

  /**
   * read item of model by key
   * @param modelClazz the corresponding ModelConstructor
   * @param key partial of T that contains PartitionKey and SortKey (if necessary). Throws if missing.
   */
  forModel<T>(modelClazz: ModelConstructor<T>, key: Partial<T>): TransactGetRequest1<T> {
    // check if modelClazz is really an @Model() decorated class
    const metadata = metadataForModel(modelClazz)
    if (!metadata.modelOptions) {
      throw new Error('given ModelConstructor has no @Model decorator')
    }

    this.tables.push(modelClazz)

    // check if table was already used in this request
    const tableName = getTableName(metadata)

    // check if keys to add do not exceed max count
    if (this.params.TransactItems.length + 1 > MAX_REQUEST_ITEM_COUNT) {
      throw new Error(`you can request at max ${MAX_REQUEST_ITEM_COUNT} items per request`)
    }

    this.params.TransactItems.push({
      Get: {
        TableName: tableName,
        Key: createToKeyFn(modelClazz)(key),
      },
    })
    return <any>this
  }

  /**
   * return ConsumedCapacity of the corresponding tables in the response
   */
  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): TransactGetRequest {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  /**
   * execute request and return the raw response (without parsing the attributes to js objects)
   */
  execNoMap(): Promise<DynamoDB.TransactGetItemsOutput> {
    return this.dynamoDBWrapper.transactGetItems(this.params)
  }

  /**
   * execute request and return full response with the mapped js objects.
   */
  execFullResponse(): Promise<
    TransactGetFullResponse<any[] /* real type defined in transact-get.request.type.ts: TransactGetRequest1 - 10 */>
  > {
    return this.dynamoDBWrapper.transactGetItems(this.params).then(this.mapResponse)
  }

  /**
   * execute request and return the parsed items.
   */
  exec(): Promise<any[] /* real type defined in transact-get.request.type.ts: TransactGetRequest1 - 10 */> {
    return this.dynamoDBWrapper
      .transactGetItems(this.params)
      .then(this.mapResponse)
      .then((r) => r.Items)
  }

  private mapResponse = (
    response: DynamoDB.TransactGetItemsOutput,
  ): TransactGetFullResponse<
    any[] /* real type defined in transact-get.request.type.ts: TransactGetRequest1 - 10 */
  > => {
    const Items: any =
      response.Responses && Object.keys(response.Responses).length
        ? response.Responses.map((item, ix) => fromDb(<Attributes>item.Item, this.tables[ix]))
        : []
    return {
      ConsumedCapacity: response.ConsumedCapacity,
      Items,
    }
  }
}
