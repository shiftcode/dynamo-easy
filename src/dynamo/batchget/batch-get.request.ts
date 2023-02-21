/**
 * @module multi-model-requests/batch-get
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { metadataForModel } from '../../decorator/metadata/metadata-for-model.function'
import { randomExponentialBackoffTimer } from '../../helper/random-exponential-backoff-timer.generator'
import { createToKeyFn, fromDb } from '../../mapper/mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { getTableName } from '../get-table-name.function'
import { BatchGetFullResponse } from './batch-get-full.response'
import { batchGetItemsFetchAll } from './batch-get-utils'
import { BATCH_GET_DEFAULT_TIME_SLOT, BATCH_GET_MAX_REQUEST_ITEM_COUNT } from './batch-get.const'
import { BatchGetResponse } from './batch-get.response'

/**
 * Request class for the BatchGetItem operation. Read multiple items from one or more tables.
 */
export class BatchGetRequest {
  get dynamoDB(): DynamoDB.DynamoDB {
    return this.dynamoDBWrapper.dynamoDB
  }

  readonly params: DynamoDB.BatchGetItemInput & {
    RequestItems: NonNullable<DynamoDB.BatchGetItemInput['RequestItems']>
  }
  private readonly dynamoDBWrapper: DynamoDbWrapper
  private readonly tables: Map<string, ModelConstructor<any>> = new Map()
  private itemCounter = 0

  constructor(dynamoDB: DynamoDB.DynamoDB) {
    this.dynamoDBWrapper = new DynamoDbWrapper(dynamoDB)
    this.params = {
      RequestItems: {},
    }
  }

  /**
   * return ConsumedCapacity of the corresponding tables in the response
   */
  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): BatchGetRequest {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  /**
   * read items of model by key
   * @param modelClazz the corresponding ModelConstructor
   * @param keys an array of partials of T that contains PartitionKey and SortKey (if necessary). Throws if missing.
   * @param consistentRead set to true so the operation uses strongly consistent reads, default false
   */
  forModel<T>(modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>, consistentRead = false): BatchGetRequest {
    // check if modelClazz is really an @Model() decorated class
    const metadata = metadataForModel(modelClazz)
    if (!metadata.modelOptions) {
      throw new Error('given ModelConstructor has no @Model decorator')
    }

    // check if table was already used in this request
    const tableName = getTableName(metadata)
    if (this.tables.has(tableName)) {
      throw new Error('table name already exists, please provide all the keys for the same table at once')
    }
    this.tables.set(tableName, modelClazz)

    // check if keys to add do not exceed max count
    if (this.itemCounter + keys.length > BATCH_GET_MAX_REQUEST_ITEM_COUNT) {
      throw new Error(`you can request at max ${BATCH_GET_MAX_REQUEST_ITEM_COUNT} items per request`)
    }

    this.params.RequestItems[tableName] = {
      Keys: keys.map(createToKeyFn(modelClazz)),
      ConsistentRead: consistentRead,
    }

    this.itemCounter += keys.length

    return this
  }

  /**
   * execute the request and return the raw response (without parsing the attributes to js objects)
   * @param backoffTimer when unprocessed items are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  execNoMap(
    backoffTimer = randomExponentialBackoffTimer,
    throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT,
  ): Promise<DynamoDB.BatchGetItemOutput> {
    return this.fetch(backoffTimer, throttleTimeSlot)
  }

  /**
   * execute and return full response with the mapped js objects per table
   * @param backoffTimer when unprocessed items are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  execFullResponse(
    backoffTimer = randomExponentialBackoffTimer,
    throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT,
  ): Promise<BatchGetFullResponse> {
    return this.fetch(backoffTimer, throttleTimeSlot).then(this.mapResponse)
  }

  /**
   * execute and return the parsed items per table
   * @param backoffTimer when unprocessed items are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  exec(
    backoffTimer = randomExponentialBackoffTimer,
    throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT,
  ): Promise<BatchGetResponse> {
    return this.fetch(backoffTimer, throttleTimeSlot)
      .then(this.mapResponse)
      .then((r) => r.Responses)
  }

  private fetch(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT) {
    return batchGetItemsFetchAll(this.dynamoDBWrapper, { ...this.params }, backoffTimer(), throttleTimeSlot)
  }

  private mapResponse = (response: DynamoDB.BatchGetItemOutput): BatchGetFullResponse => {
    let Responses: BatchGetResponse = {}

    if (response.Responses && Object.keys(response.Responses).length) {
      Responses = Object.entries(response.Responses).reduce((u: BatchGetResponse, [key, val]) => {
        u[key] = val.map((attributes) => fromDb(<Attributes>attributes, this.tables.get(key)))
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
