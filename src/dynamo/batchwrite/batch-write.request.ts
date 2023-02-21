/**
 * @module multi-model-requests/batch-write
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { randomExponentialBackoffTimer } from '../../helper/random-exponential-backoff-timer.generator'
import { createToKeyFn, toDb } from '../../mapper/mapper'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { getTableName } from '../get-table-name.function'
import { batchWriteItemsWriteAll } from './batch-write-utils'
import { BATCH_WRITE_DEFAULT_TIME_SLOT, BATCH_WRITE_MAX_REQUEST_ITEM_COUNT } from './batch-write.const'

/**
 * Request class for the BatchWriteItem operation. Put or delete multiple items in one or more table.
 */
export class BatchWriteRequest {
  get dynamoDB(): DynamoDB.DynamoDB {
    return this.dynamoDBWrapper.dynamoDB
  }

  readonly params: DynamoDB.BatchWriteItemInput & { RequestItems: Record<string, DynamoDB.WriteRequest[]> }
  private readonly dynamoDBWrapper: DynamoDbWrapper
  private itemCount = 0

  constructor(dynamoDB: DynamoDB.DynamoDB) {
    this.dynamoDBWrapper = new DynamoDbWrapper(dynamoDB)
    this.params = {
      RequestItems: {},
    }
  }

  /**
   * return ConsumedCapacity of the corresponding tables in the response
   */
  returnConsumedCapacity(value: DynamoDB.ReturnConsumedCapacity): BatchWriteRequest {
    this.params.ReturnConsumedCapacity = value
    return this
  }

  /**
   * return item collection metrics.
   */
  returnItemCollectionMetrics(value: DynamoDB.ReturnItemCollectionMetrics): BatchWriteRequest {
    this.params.ReturnItemCollectionMetrics = value
    return this
  }

  /**
   * add keys for deletion
   * @param modelClazz the corresponding ModelConstructor
   * @param keys an array of partials of T that contains PartitionKey and SortKey (if necessary). Throws if missing.
   */
  delete<T>(modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>): BatchWriteRequest {
    this.requestItems(modelClazz, keys.map(this.createDeleteRequest(modelClazz)))
    return this
  }

  /**
   * add items to put
   * @param modelClazz the corresponding ModelConstructor
   * @param items the items to put
   */
  put<T>(modelClazz: ModelConstructor<T>, items: T[]): BatchWriteRequest {
    this.requestItems(modelClazz, items.map(this.createPutRequest(modelClazz)))
    return this
  }

  /**
   * execute request
   * @param backoffTimer generator for how much timeSlots should be waited before requesting next batch. only used when capacity was exceeded. default randomExponentialBackoffTimer
   * @param throttleTimeSlot defines how long one timeSlot is for throttling, default 1 second
   */
  exec(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_WRITE_DEFAULT_TIME_SLOT): Promise<void> {
    return this.write(backoffTimer, throttleTimeSlot).then(() => {
      return
    })
  }

  /**
   * execute request and return (last) response
   * @param backoffTimer generator for how much timeSlots should be waited before requesting next batch. only used when capacity was exceeded. default randomExponentialBackoffTimer
   * @param throttleTimeSlot defines how long one timeSlot is for throttling, default 1 second
   */
  execFullResponse(
    backoffTimer = randomExponentialBackoffTimer,
    throttleTimeSlot = BATCH_WRITE_DEFAULT_TIME_SLOT,
  ): Promise<DynamoDB.BatchWriteItemOutput> {
    return this.write(backoffTimer, throttleTimeSlot)
  }

  private requestItems(modelClazz: ModelConstructor<any>, items: DynamoDB.WriteRequest[]) {
    if (this.itemCount + items.length > BATCH_WRITE_MAX_REQUEST_ITEM_COUNT) {
      throw new Error(`batch write takes at max ${BATCH_WRITE_MAX_REQUEST_ITEM_COUNT} items`)
    }
    const tableName = getTableName(modelClazz)
    this.params.RequestItems[tableName] = this.params.RequestItems[tableName] || []
    this.params.RequestItems[tableName].push(...items)
    this.itemCount += items.length
  }

  private write(backoffTimer: () => IterableIterator<number>, throttleTimeSlot: number) {
    return batchWriteItemsWriteAll(this.dynamoDBWrapper, { ...this.params }, backoffTimer(), throttleTimeSlot)
  }

  private createDeleteRequest = <T>(modelClazz: ModelConstructor<T>) => {
    const toKey = createToKeyFn(modelClazz)
    return (item: Partial<T>): DynamoDB.WriteRequest => ({ DeleteRequest: { Key: toKey(item) } })
  }

  private createPutRequest = <T>(modelClazz: ModelConstructor<T>) => {
    return (item: T): DynamoDB.WriteRequest => ({ PutRequest: { Item: toDb(item, modelClazz) } })
  }
}
