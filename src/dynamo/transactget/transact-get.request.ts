import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { metadataForModel } from '../../decorator/metadata/metadata-helper'
import { createToKeyFn, fromDb } from '../../mapper/mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { getTableName } from '../get-table-name.function'
import { TransactGetFullResponse } from './transact-get-full.response'
import { TransactGetRequest1 } from './transact-get.request.type'

const MAX_REQUEST_ITEM_COUNT = 10

export class TransactGetRequest {
  readonly params: DynamoDB.TransactGetItemsInput
  private readonly dynamoDBWrapper: DynamoDbWrapper
  private readonly tables: Array<ModelConstructor<any>> = []

  constructor() {
    this.dynamoDBWrapper = new DynamoDbWrapper()
    this.params = {
      TransactItems: [],
    }
  }

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

  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): TransactGetRequest {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  execNoMap(): Promise<DynamoDB.TransactGetItemsOutput> {
    return this.dynamoDBWrapper.transactGetItems(this.params)
  }

  execFullResponse(): Promise<TransactGetFullResponse<any[] /* real type defined in transact-get.request.type.ts: TransactGetRequest1 - 10 */>> {
    return this.dynamoDBWrapper.transactGetItems(this.params)
      .then(this.mapResponse)
  }

  exec(): Promise<any[] /* real type defined in transact-get.request.type.ts: TransactGetRequest1 - 10 */> {
    return this.dynamoDBWrapper.transactGetItems(this.params)
      .then(this.mapResponse)
      .then(r => r.Items)
  }

  private mapResponse = (response: DynamoDB.TransactGetItemsOutput): TransactGetFullResponse<any[] /* real type defined in transact-get.request.type.ts: TransactGetRequest1 - 10 */> => {
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
