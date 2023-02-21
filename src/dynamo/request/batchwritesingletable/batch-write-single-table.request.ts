/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { randomExponentialBackoffTimer } from '../../../helper/random-exponential-backoff-timer.generator'
import { createLogger, Logger } from '../../../logger/logger'
import { createToKeyFn, toDb } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { batchWriteItemsWriteAll } from '../../batchwrite/batch-write-utils'
import { BATCH_WRITE_DEFAULT_TIME_SLOT, BATCH_WRITE_MAX_REQUEST_ITEM_COUNT } from '../../batchwrite/batch-write.const'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { BaseRequest } from '../base.request'

/**
 * Request class for BatchWriteItem operation which supports a single model class only.
 */
export class BatchWriteSingleTableRequest<T, T2 = T> extends BaseRequest<
  T,
  T2,
  DynamoDB.BatchWriteItemInput & { RequestItems: NonNullable<DynamoDB.BatchWriteItemInput['RequestItems']> },
  BatchWriteSingleTableRequest<T, T2>
> {
  private readonly logger: Logger
  private toKey = createToKeyFn(this.modelClazz)

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.BatchWriteSingleTableRequest', modelClazz)
    this.params.RequestItems = {
      [this.tableName]: [],
    }
  }

  /**
   * return item collection metrics.
   */
  returnItemCollectionMetrics(value: DynamoDB.ReturnItemCollectionMetrics): this {
    this.params.ReturnItemCollectionMetrics = value
    return this
  }

  delete(items: Array<Partial<T>>): this {
    if (this.params.RequestItems[this.tableName].length + items.length > BATCH_WRITE_MAX_REQUEST_ITEM_COUNT) {
      throw new Error(`batch write takes at max ${BATCH_WRITE_MAX_REQUEST_ITEM_COUNT} items`)
    }
    this.params.RequestItems[this.tableName].push(...items.map(this.createDeleteRequest))
    return this
  }

  put(items: T[]): this {
    if (this.params.RequestItems[this.tableName].length + items.length > BATCH_WRITE_MAX_REQUEST_ITEM_COUNT) {
      throw new Error(`batch write takes at max ${BATCH_WRITE_MAX_REQUEST_ITEM_COUNT} items`)
    }
    this.params.RequestItems[this.tableName].push(...items.map(this.createPutRequest))
    return this
  }

  /**
   * execute the request
   * @param backoffTimer when unprocessed items are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  exec(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_WRITE_DEFAULT_TIME_SLOT): Promise<void> {
    this.logger.debug('starting batchWriteItem')
    return this.write(backoffTimer, throttleTimeSlot).then(() => {
      return
    })
  }

  /**
   * execute the request and return the full response
   * @param backoffTimer when unprocessed items are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  execFullResponse(
    backoffTimer = randomExponentialBackoffTimer,
    throttleTimeSlot = BATCH_WRITE_DEFAULT_TIME_SLOT,
  ): Promise<DynamoDB.BatchWriteItemOutput> {
    return this.write(backoffTimer, throttleTimeSlot)
  }

  private write(backoffTimer: () => IterableIterator<number>, throttleTimeSlot: number) {
    return batchWriteItemsWriteAll(this.dynamoDBWrapper, { ...this.params }, backoffTimer(), throttleTimeSlot)
  }

  private createDeleteRequest = (item: Partial<T>): DynamoDB.WriteRequest => ({
    DeleteRequest: { Key: this.toKey(item) },
  })
  private createPutRequest = (item: T): DynamoDB.WriteRequest => ({ PutRequest: { Item: toDb(item, this.modelClazz) } })
}
