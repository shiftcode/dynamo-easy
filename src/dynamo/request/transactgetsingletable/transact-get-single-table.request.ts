import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Attributes, createToKeyFn, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { BaseRequest } from '../base.request'
import { TransactGetResponse } from './transact-get-single-table.response'

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

  execFullResponse(): Promise<TransactGetResponse<T>> {
    return this.dynamoDBWrapper.transactGetItems(this.params)
      .then(this.mapResponse)
  }

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
