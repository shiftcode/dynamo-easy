import { DynamoDB } from 'aws-sdk'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { metadataForClass } from '../../decorator/metadata/metadata-helper'
import { randomExponentialBackoffTimer } from '../../helper'
import { createToKeyFn, fromDb } from '../../mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { getTableName } from '../get-table-name.function'
import { BatchGetFullResponse } from './batch-get-full.response'
import { batchGetItemsFetchAll } from './batch-get-utils'
import { BATCH_GET_DEFAULT_TIME_SLOT, BATCH_GET_MAX_REQUEST_ITEM_COUNT } from './batch-get.const'
import { BatchGetResponse } from './batch-get.response'



export class BatchGetRequest {
  readonly params: DynamoDB.BatchGetItemInput
  private readonly dynamoRx: DynamoRx
  private readonly tables: Map<string, ModelConstructor<any>> = new Map()
  private itemCounter = 0

  constructor() {
    this.dynamoRx = new DynamoRx()
    this.params = {
      RequestItems: {},
    }
  }

  /**
   * @param {ModelConstructor<T>} modelClazz
   * @param {Partial<T>[]} keys a partial of T that contains Partition key and SortKey (if necessary). Throws if missing.
   * @param consistentRead
   * @returns {BatchGetSingleTableRequest}
   */
  forModel<T>(modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>, consistentRead = false): BatchGetRequest {

    // check if modelClazz is really an @Model() decorated class
    const metadata = metadataForClass(modelClazz)
    if (!metadata.modelOptions) { throw new Error('given ModelConstructor has no @Model decorator')}

    // check if table was already used in this request
    const tableName = getTableName(metadata)
    if (this.tables.has(tableName)) { throw new Error('table name already exists, please provide all the keys for the same table at once') }
    this.tables.set(tableName, modelClazz)

    // check if keys to add do not exceed max count
    if (this.itemCounter + keys.length > BATCH_GET_MAX_REQUEST_ITEM_COUNT) { throw new Error(`you can request at max ${BATCH_GET_MAX_REQUEST_ITEM_COUNT} items per request`)}

    this.params.RequestItems[tableName] = {
      Keys: keys.map(createToKeyFn(modelClazz)),
      ConsistentRead: consistentRead,
    }

    this.itemCounter += keys.length

    return this
  }

  execNoMap(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT): Observable<DynamoDB.BatchGetItemOutput> {
    return this.fetch(backoffTimer, throttleTimeSlot)
  }

  execFullResponse(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT): Observable<BatchGetFullResponse> {
    return this.fetch(backoffTimer, throttleTimeSlot)
      .pipe(
        map(this.mapResponse),
      )
  }

  exec(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT): Observable<BatchGetResponse> {
    return this.fetch(backoffTimer, throttleTimeSlot)
      .pipe(
        map(this.mapResponse),
        map(r => r.Responses),
      )
  }

  private fetch(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT) {
    return batchGetItemsFetchAll(this.dynamoRx, { ...this.params }, backoffTimer(), throttleTimeSlot)
  }


  private mapResponse = (response: DynamoDB.BatchGetItemOutput): BatchGetFullResponse => {
    let Responses: BatchGetResponse = {}

    if (response.Responses && Object.keys(response.Responses).length) {
      Responses = Object.entries(response.Responses).reduce((u: BatchGetResponse, [key, val]) => {
        u[key] = val.map(attributes => fromDb(<Attributes>attributes, this.tables.get(key)))
        return u
      }, {})
    }

    return {
      ConsumedCapacity: response.ConsumedCapacity,
      UnprocessedKeys: response.UnprocessedKeys,
      Responses,
    }
  }

}
