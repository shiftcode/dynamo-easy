import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable, of } from 'rxjs'
import { delay, mergeMap } from 'rxjs/operators'
import { DynamoRx } from '../dynamo-rx'


export function batchWriteItemsWriteAll(
  dynamoRx: DynamoRx,
  params: DynamoDB.BatchWriteItemInput,
  backoffTimer: IterableIterator<number>,
  throttleTimeSlot: number,
): Observable<DynamoDB.BatchGetItemOutput> {
  return dynamoRx.batchWriteItem(params)
    .pipe(
      mergeMap(response => {
        if (hasUnprocessedItems(response)) {
          return of(response.UnprocessedItems)
            .pipe(
              delay(backoffTimer.next().value * throttleTimeSlot),
              mergeMap((unprocessedKeys: DynamoDB.BatchWriteItemRequestMap) => {
                const nextParams: DynamoDB.BatchWriteItemInput = { ...params, RequestItems: unprocessedKeys }
                return batchWriteItemsWriteAll(dynamoRx, nextParams, backoffTimer, throttleTimeSlot)
              }),
            )
        }
        return of(response)
      }),
    )
}

export type BatchWriteItemOutputWithUnprocessedItems =
  DynamoDB.BatchWriteItemOutput
  & { UnprocessedItems: DynamoDB.BatchWriteItemRequestMap }

export function hasUnprocessedItems(response: DynamoDB.BatchWriteItemOutput): response is BatchWriteItemOutputWithUnprocessedItems {
  if (!response.UnprocessedItems) {
    return false
  }
  return Object.values(response.UnprocessedItems)
    .some(t => !!t && t.length > 0)
}
