import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Attributes, createToKeyFn, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { BaseRequest } from '../base.request'
import { TransactGetResponse } from './transact-get-single-table.response'

export class TransactGetSingleTableRequest<T> extends BaseRequest<T, DynamoDB.TransactGetItemsInput> {

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>) {
    super(dynamoRx, modelClazz)

    this.params.TransactItems = keys.map(key => ({
      Get: {
        TableName: this.tableName,
        Key: createToKeyFn(this.modelClazz)(key),
      },
    }))
  }

  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): TransactGetSingleTableRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  execFullResponse(): Observable<TransactGetResponse<T>> {
    return this.dynamoRx.transactGetItems(this.params).pipe(map(this.mapResponse))
  }

  exec(): Observable<T[]> {
    return this.dynamoRx.transactGetItems(this.params).pipe(
      map(this.mapResponse),
      map(r => r.Items),
    )
  }

  private mapResponse = (response: DynamoDB.TransactGetItemsOutput): TransactGetResponse<T> => {
    return {
      ConsumedCapacity: response.ConsumedCapacity,
      Items: (response.Responses || []).map(item => fromDb(<Attributes<T>>item.Item, this.modelClazz)),
    }
  }
}
