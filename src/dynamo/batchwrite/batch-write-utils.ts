import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseDelay } from '../../helper'
import { DynamoRx } from '../dynamo-rx'

/**
 * Function which executes batchWriteItem operations until all given items (as params) are processed (written).
 * Between each follow-up request (in case of unprocessed items) a delay is interposed calculated by the given backoffTime and throttleTimeSlot.
 * @param dynamoRx
 * @param params containing the items per table to create the batchWrite operation
 * @param backoffTimer used to determine how many time slots the follow-up request should be delayed
 * @param throttleTimeSlot used to calculate the effective wait time
 */
export function batchWriteItemsWriteAll(
  dynamoRx: DynamoRx,
  params: DynamoDB.BatchWriteItemInput,
  backoffTimer: IterableIterator<number>,
  throttleTimeSlot: number,
): Promise<DynamoDB.BatchGetItemOutput> {
  return dynamoRx.batchWriteItem(params)
    .then(response => {
      if (hasUnprocessedItems(response)) {
        // in case of unprocessedItems do a follow-up requests
        return Promise.resolve(response.UnprocessedItems)
          // delay before doing the follow-up request
          .then(promiseDelay(backoffTimer.next().value * throttleTimeSlot))
          .then(unprocessedKeys => {
            const nextParams: DynamoDB.BatchWriteItemInput = { ...params, RequestItems: unprocessedKeys }
            // call recursively batchWriteItemsWriteAll with the returned UnprocessedItems params
            return batchWriteItemsWriteAll(dynamoRx, nextParams, backoffTimer, throttleTimeSlot)
          })
        // no combining of responses necessary, only the last response is returned
      }
      // no follow-up request necessary, return result
      return response
    })
}

export type BatchWriteItemOutputWithUnprocessedItems = DynamoDB.BatchWriteItemOutput & {
  UnprocessedItems: DynamoDB.BatchWriteItemRequestMap
}

export function hasUnprocessedItems(
  response: DynamoDB.BatchWriteItemOutput,
): response is BatchWriteItemOutputWithUnprocessedItems {
  if (!response.UnprocessedItems) {
    return false
  }
  return Object.values(response.UnprocessedItems).some(t => !!t && t.length > 0)
}
