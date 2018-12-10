import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Metadata, metadataForClass } from '../../../decorator/metadata'
import { randomExponentialBackoffTimer } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, createToKeyFn, toDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { getTableName } from '../../get-table-name.function'
import { batchWriteItemsWriteAll } from './batch-write-utils'

const MAX_BATCH_WRITE_ITEMS = 25
const DEFAULT_TIME_SLOT = 1000

export class BatchWriteSingleTableRequest<T> {

  private get toKey(): (item: T) => Attributes {
    if (!this.keyFn) {
      this.keyFn = createToKeyFn(this.modelClazz)
    }
    return this.keyFn
  }

  readonly dynamoRx: DynamoRx
  readonly modelClazz: ModelConstructor<T>
  readonly metadata:Metadata<T>
  readonly tableName: string
  readonly params: DynamoDB.BatchWriteItemInput

  private readonly logger: Logger

  private keyFn: any

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    this.logger = createLogger('dynamo.request.BatchWriteSingleTableRequest', modelClazz)
    this.dynamoRx = dynamoRx

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error("please provide the model clazz for the request, won't work otherwise")
    }
    this.modelClazz = modelClazz

    this.metadata = metadataForClass(this.modelClazz)
    if (!this.metadata.modelOptions) {
      throw new Error('given ModelConstructor has no @Model decorator')
    }

    this.tableName = getTableName(this.metadata)

    this.params = {
      RequestItems: {
        [this.tableName]: [],
      },
    }
  }

  returnConsumedCapacity(value: DynamoDB.ReturnConsumedCapacity) {
    this.params.ReturnConsumedCapacity = value
  }

  returnItemCollectionMetrics(value: DynamoDB.ReturnItemCollectionMetrics) {
    this.params.ReturnItemCollectionMetrics = value
  }

  delete(items: T[]): BatchWriteSingleTableRequest<T> {
    if (this.params.RequestItems[this.tableName].length + items.length > MAX_BATCH_WRITE_ITEMS) {
      throw new Error(`batch write takes at max ${MAX_BATCH_WRITE_ITEMS} items`)
    }
    this.params.RequestItems[this.tableName].push(...items.map(this.createDeleteRequest))
    return this
  }

  put(items: T[]): BatchWriteSingleTableRequest<T> {
    if (this.params.RequestItems[this.tableName].length + items.length > MAX_BATCH_WRITE_ITEMS) {
      throw new Error(`batch write takes at max ${MAX_BATCH_WRITE_ITEMS} items`)
    }
    this.params.RequestItems[this.tableName].push(...items.map(this.createPutRequest))
    return this
  }

  /**
   *
   * @param backoffTimer generator for how much timeSlots should be waited before requesting next batch. only used when capacity was exceeded. default randomExponentialBackoffTimer
   * @param throttleTimeSlot defines how long one timeSlot is for throttling, default 1 second
   */
  exec(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = DEFAULT_TIME_SLOT): Observable<void> {
    this.logger.debug('starting batchWriteItem')
    return this.write(backoffTimer, throttleTimeSlot).pipe(
      map(() => {
        return
      }),
    )
  }

  execFullResponse(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = DEFAULT_TIME_SLOT): Observable<DynamoDB.BatchWriteItemOutput> {
    return this.write(backoffTimer, throttleTimeSlot)
  }

  private write(backoffTimer: () => IterableIterator<number>, throttleTimeSlot: number) {
    return batchWriteItemsWriteAll(this.dynamoRx, { ...this.params }, backoffTimer(), throttleTimeSlot)
  }

  private createDeleteRequest = (item: T): DynamoDB.WriteRequest => ({ DeleteRequest: { Key: this.toKey(item) } })
  private createPutRequest = (item: T): DynamoDB.WriteRequest => ({ PutRequest: { Item: toDb(item, this.modelClazz) } })
}
