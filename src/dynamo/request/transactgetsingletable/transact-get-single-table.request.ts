import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Attributes, createToKeyFn, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { BaseRequest } from '../base.request'
import { TransactGetResponse } from './transact-get-single-table.response'

export class TransactGetSingleTableRequest<T> extends BaseRequest<T,
  DynamoDB.TransactGetItemsInput,
  TransactGetSingleTableRequest<T>> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>) {
    super(dynamoRx, modelClazz)

    this.params.TransactItems = keys.map(key => ({
      Get: {
        TableName: this.tableName,
        Key: createToKeyFn(this.modelClazz)(key),
      },
    }))
  }

  execFullResponse(): Promise<TransactGetResponse<T>> {
    return this.dynamoRx.transactGetItems(this.params)
      .then(this.mapResponse)
  }

  exec(): Promise<T[]> {
    return this.dynamoRx.transactGetItems(this.params)
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
