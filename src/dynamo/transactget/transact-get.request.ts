import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { metadataForClass } from '../../decorator/metadata/metadata-helper'
import { Attributes, createToKeyFn, fromDb } from '../../mapper'
import { ModelConstructor } from '../../model'
import { DynamoRx } from '../dynamo-rx'
import { getTableName } from '../get-table-name.function'
import { TransactGetFullResponse } from './transact-get-full.response'
import { TransactGetRequest1 } from './transact-get.request.type'

const MAX_REQUEST_ITEM_COUNT = 10

export class TransactGetRequest {
  readonly params: DynamoDB.TransactGetItemsInput
  private readonly dynamoRx: DynamoRx
  private readonly tables: Array<ModelConstructor<any>> = []

  constructor() {
    this.dynamoRx = new DynamoRx()
    this.params = {
      TransactItems: [],
    }
  }

  private mapResponse = (response: DynamoDB.TransactGetItemsOutput): TransactGetFullResponse<[]> => {
    const Items: any = response.Responses && Object.keys(response.Responses).length
      ? response.Responses.map((item, ix) => fromDb(<Attributes>item.Item, this.tables[ix]))
      : []
    return {
      ConsumedCapacity: response.ConsumedCapacity,
      Items,
    }
  }

  forModel<T>(modelClazz: ModelConstructor<T>, key: Partial<T>): TransactGetRequest1<T> {

    // check if modelClazz is really an @Model() decorated class
    const metadata = metadataForClass(modelClazz)
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
      },
    )
    return <any>this
  }

  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): TransactGetRequest {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  execNoMap(): Observable<DynamoDB.TransactGetItemsOutput> {
    return this.dynamoRx.transactGetItems(this.params)
  }

  execFullResponse(): Observable<TransactGetFullResponse<[]>> {
    return this.dynamoRx.transactGetItems(this.params).pipe(
      map(this.mapResponse),
    )
  }

  exec(): Observable<[]> {
    return this.dynamoRx.transactGetItems(this.params).pipe(
      map(this.mapResponse),
      map(r => r.Items),
    )
  }

}

