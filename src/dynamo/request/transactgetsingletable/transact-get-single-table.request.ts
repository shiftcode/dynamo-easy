/**
 * @module store-requests
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { createToKeyFn, fromDb } from '../../../mapper/mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { BaseRequest } from '../base.request'
import { TransactGetResponse } from './transact-get-single-table.response'

/**
 * Request class for TransactGetItems operation which supports a single model class only.
 */
export class TransactGetSingleTableRequest<T> extends BaseRequest<T,
  DynamoDB.TransactGetItemsInput,
  TransactGetSingleTableRequest<T>> {
  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>) {
    super(dynamoDBWrapper, modelClazz)

    this.params.TransactItems = keys.map(key => ({
      Get: {
        TableName: this.tableName,
        Key: createToKeyFn(this.modelClazz)(key),
      },
    }))
  }

  /**
   * fetch all entries and return the raw response (without parsing the attributes to js objects)
   */
  execNoMap(): Promise<DynamoDB.TransactGetItemsOutput> {
    return this.dynamoDBWrapper.transactGetItems(this.params)
  }

  execFullResponse(): Promise<TransactGetResponse<T>> {
    return this.dynamoDBWrapper.transactGetItems(this.params)
      .then(this.mapResponse)
  }

  /**
   * execute request and return the parsed items
   */
  exec(): Promise<T[]> {
    return this.dynamoDBWrapper.transactGetItems(this.params)
      .then(this.mapResponse)
      .then(r => r.Items)

  }

  private mapResponse = (response: DynamoDB.TransactGetItemsOutput): TransactGetResponse<T> => {
    return {
      ConsumedCapacity: response.ConsumedCapacity,
      Items: (response.Responses || []).map(item => fromDb(<Attributes<T>>item.Item, this.modelClazz)),
    }
  }
}
