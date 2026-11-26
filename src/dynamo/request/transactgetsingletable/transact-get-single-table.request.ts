/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createToKeyFn, fromDb } from '../../../mapper/mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { BaseRequest } from '../base.request'
import { TransactGetResponse } from './transact-get-single-table.response'

/**
 * Request class for TransactGetItems operation which supports a single model class only.
 */
export class TransactGetSingleTableRequest<T, T2 = T> extends BaseRequest<
  T,
  T2,
  DynamoDB.TransactGetItemsInput,
  TransactGetSingleTableRequest<T, T2>
> {
  constructor(client: DynamoDB.DynamoDBClient, modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>) {
    super(client, modelClazz)

    this.params.TransactItems = keys.map((key) => ({
      Get: {
        TableName: this.tableName,
        Key: createToKeyFn(this.modelClazz)(key),
      },
    }))
  }

  /**
   * fetch all entries and return the raw response (without parsing the attributes to js objects)
   */
  execNoMap(): Promise<DynamoDB.TransactGetItemsCommandOutput> {
    return this.client.send(new DynamoDB.TransactGetItemsCommand(this.params))
  }

  execFullResponse(): Promise<TransactGetResponse<T2>> {
    return this.client.send(new DynamoDB.TransactGetItemsCommand(this.params)).then(this.mapResponse)
  }

  /**
   * execute request and return the parsed items
   */
  exec(): Promise<T2[]> {
    return this.client
      .send(new DynamoDB.TransactGetItemsCommand(this.params))
      .then(this.mapResponse)
      .then((r) => r.Items)
  }

  private mapResponse = (response: DynamoDB.TransactGetItemsCommandOutput): TransactGetResponse<T2> => {
    return {
      $metadata: response.$metadata,
      ConsumedCapacity: response.ConsumedCapacity,
      Items: (response.Responses || []).map((item) => fromDb(<Attributes<T2>>item.Item, <any>this.modelClazz)),
    }
  }
}
