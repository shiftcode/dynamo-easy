import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { randomExponentialBackoffTimer } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { createToKeyFn, toDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { batchWriteItemsWriteAll } from '../../batchwrite/batch-write-utils'
import { BATCH_WRITE_DEFAULT_TIME_SLOT, BATCH_WRITE_MAX_REQUEST_ITEM_COUNT } from '../../batchwrite/batch-write.const'
import { DynamoRx } from '../../dynamo-rx'
import { BaseRequest } from '../base.request'

export class BatchWriteSingleTableRequest<T> extends BaseRequest<T, DynamoDB.BatchWriteItemInput, BatchWriteSingleTableRequest<T>> {
  private readonly logger: Logger
  private toKey = createToKeyFn(this.modelClazz)

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.BatchWriteSingleTableRequest', modelClazz)
    this.params.RequestItems = {
      [this.tableName]: [],
    }
  }

  returnItemCollectionMetrics(value: DynamoDB.ReturnItemCollectionMetrics) {
    this.params.ReturnItemCollectionMetrics = value
  }

  delete(items: T[]): BatchWriteSingleTableRequest<T> {
    if (this.params.RequestItems[this.tableName].length + items.length > BATCH_WRITE_MAX_REQUEST_ITEM_COUNT) {
      throw new Error(`batch write takes at max ${BATCH_WRITE_MAX_REQUEST_ITEM_COUNT} items`)
    }
    this.params.RequestItems[this.tableName].push(...items.map(this.createDeleteRequest))
    return this
  }

  put(items: T[]): BatchWriteSingleTableRequest<T> {
    if (this.params.RequestItems[this.tableName].length + items.length > BATCH_WRITE_MAX_REQUEST_ITEM_COUNT) {
      throw new Error(`batch write takes at max ${BATCH_WRITE_MAX_REQUEST_ITEM_COUNT} items`)
    }
    this.params.RequestItems[this.tableName].push(...items.map(this.createPutRequest))
    return this
  }

  /**
   * write all given items
   * @param backoffTimer when unprocessed items are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  exec(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_WRITE_DEFAULT_TIME_SLOT): Observable<void> {
    this.logger.debug('starting batchWriteItem')
    return this.write(backoffTimer, throttleTimeSlot).pipe(
      map(() => {
        return
      }),
    )
  }

  execFullResponse(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_WRITE_DEFAULT_TIME_SLOT): Observable<DynamoDB.BatchWriteItemOutput> {
    return this.write(backoffTimer, throttleTimeSlot)
  }

  private write(backoffTimer: () => IterableIterator<number>, throttleTimeSlot: number) {
    return batchWriteItemsWriteAll(this.dynamoRx, { ...this.params }, backoffTimer(), throttleTimeSlot)
  }

  private createDeleteRequest = (item: T): DynamoDB.WriteRequest => ({ DeleteRequest: { Key: this.toKey(item) } })
  private createPutRequest = (item: T): DynamoDB.WriteRequest => ({ PutRequest: { Item: toDb(item, this.modelClazz) } })
}
