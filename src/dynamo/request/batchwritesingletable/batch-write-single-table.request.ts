import { BatchWriteItemInput, BatchWriteItemOutput, WriteRequest, WriteRequests } from 'aws-sdk/clients/dynamodb'
import { Observable, of } from 'rxjs'
import { delay, map, mergeMap, tap } from 'rxjs/operators'
import { DynamoRx } from '../../../dynamo/dynamo-rx'
import { randomExponentialBackoffTimer } from '../../../helper'
import { Mapper } from '../../../mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { BatchWriteSingleTableResponse } from './batch-write-single-table.response'

const MAX_BATCH_WRITE_ITEMS = 25

export class BatchWriteSingleTableRequest<T> {
  private get toKey(): (item: T) => Attributes {
    if (!this._keyFn) {
      this._keyFn = Mapper.createToKeyFn(this.modelClazz)
    }
    return this._keyFn
  }

  readonly dynamoRx: DynamoRx
  readonly modelClazz: ModelConstructor<T>
  readonly tableName: string
  readonly itemsToProcess: WriteRequests

  private _keyFn: any

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    this.dynamoRx = dynamoRx

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error("please provide the model clazz for the request, won't work otherwise")
    }
    this.modelClazz = modelClazz
    this.tableName = tableName

    this.itemsToProcess = []
  }

  delete(items: T[]): BatchWriteSingleTableRequest<T> {
    this.itemsToProcess.push(...items.map<WriteRequest>(item => ({ DeleteRequest: { Key: this.toKey(item) } })))
    return this
  }

  put(items: T[]): BatchWriteSingleTableRequest<T> {
    this.itemsToProcess.push(
      ...items.map<WriteRequest>(item => ({ PutRequest: { Item: Mapper.toDb(item, this.modelClazz) } }))
    )
    return this
  }

  private execNextBatch(): Observable<BatchWriteSingleTableResponse> {
    const batch = this.itemsToProcess.splice(0, MAX_BATCH_WRITE_ITEMS)
    const batchWriteItemInput: BatchWriteItemInput = {
      RequestItems: {
        [this.tableName]: batch,
      },
    }

    return this.dynamoRx.batchWriteItem(batchWriteItemInput).pipe(
      tap((batchWriteManyResponse: BatchWriteItemOutput) => {
        if (batchWriteManyResponse.UnprocessedItems && batchWriteManyResponse.UnprocessedItems[this.tableName]) {
          this.itemsToProcess.unshift(...batchWriteManyResponse.UnprocessedItems[this.tableName])
        }
      }),
      map((batchWriteManyResponse: BatchWriteItemOutput) => ({
        remainingItems: this.itemsToProcess.length,
        capacityExceeded: !!(
          batchWriteManyResponse.UnprocessedItems && batchWriteManyResponse.UnprocessedItems[this.tableName]
        ),
        consumedCapacity: batchWriteManyResponse.ConsumedCapacity,
      }))
    )
  }

  /**
   *
   * @param backoffTimer generator for how much timeSlots should be waited before requesting next batch. only used when capacity was exceeded. default randomExponentialBackoffTimer
   * @param throttleTimeSlot defines how long one timeSlot is for throttling, default 1 second
   */
  exec(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = 1000): Observable<void> {
    let rBoT = backoffTimer()
    let backoffTime = 0
    return this.execNextBatch().pipe(
      mergeMap((r: BatchWriteSingleTableResponse) => {
        if (!r.capacityExceeded) {
          rBoT = backoffTimer()
          backoffTime = 0
        } else {
          backoffTime = rBoT.next().value
        }
        return of(r).pipe(delay(backoffTime * throttleTimeSlot))
      }),
      mergeMap((r: BatchWriteSingleTableResponse) => {
        if (r.remainingItems > 0) {
          return this.exec()
        } else {
          return of()
        }
      })
    )
  }
}
