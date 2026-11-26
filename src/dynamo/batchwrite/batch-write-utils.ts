/**
 * @module multi-model-requests/batch-write
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { promiseDelay } from '../../helper/promise-delay.function'
import { BATCH_WRITE_DEFAULT_MAX_DELAY, BATCH_WRITE_DEFAULT_MAX_RETRIES } from './batch-write.const'

/**
 * Function which executes batchWriteItem operations until all given items (as params) are processed (written).
 * Between each follow-up request (in case of unprocessed items) a delay is interposed calculated by the given backoffTime and throttleTimeSlot.
 * Own backoff crucial: partially throttled batches succeed with `UnprocessedItems` instead of throwing,
 * Resending instantly would likely hit the same throttled partitions again (hot loop of partial successes, adding load).
 * AWS recommends exponential backoff. @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
 * @param client
 * @param params containing the items per table to create the batchWrite operation
 * @param backoffTimer used to determine how many time slots the follow-up request should be delayed
 * @param throttleTimeSlot used to calculate the effective wait time
 * @param maxDelay upper bound in ms for a single delay between follow-up requests
 * @param maxRetries max number of follow-up requests. rejects if there are still UnprocessedItems afterwards
 * @hidden
 */
export function batchWriteItemsWriteAll(
  client: DynamoDB.DynamoDBClient,
  params: DynamoDB.BatchWriteItemInput,
  backoffTimer: IterableIterator<number>,
  throttleTimeSlot: number,
  maxDelay = BATCH_WRITE_DEFAULT_MAX_DELAY,
  maxRetries = BATCH_WRITE_DEFAULT_MAX_RETRIES,
): Promise<DynamoDB.BatchWriteItemCommandOutput> {
  return client.send(new DynamoDB.BatchWriteItemCommand(params)).then((response) => {
    if (hasUnprocessedItems(response)) {
      if (maxRetries <= 0) {
        throw new Error(
          `batchWriteItemsWriteAll: still UnprocessedItems after max retries: ${JSON.stringify(response.UnprocessedItems)}`,
        )
      }
      // in case of unprocessedItems do a follow-up requests
      return (
        Promise.resolve(response.UnprocessedItems)
          // delay before doing the follow-up request
          .then(promiseDelay(Math.min(backoffTimer.next().value * throttleTimeSlot, maxDelay)))
          .then((unprocessedKeys) => {
            const nextParams: DynamoDB.BatchWriteItemInput = { ...params, RequestItems: unprocessedKeys }
            // call recursively batchWriteItemsWriteAll with the returned UnprocessedItems params
            return batchWriteItemsWriteAll(client, nextParams, backoffTimer, throttleTimeSlot, maxDelay, maxRetries - 1)
          })
      )
      // no combining of responses necessary, only the last response is returned
    }
    // no follow-up request necessary, return result
    return response
  })
}

/**
 * @hidden
 */
export type BatchWriteItemOutputWithUnprocessedItems = DynamoDB.BatchWriteItemOutput & {
  UnprocessedItems: Record<string, DynamoDB.WriteRequest[]>
}

/**
 * @hidden
 */
export function hasUnprocessedItems(
  response: DynamoDB.BatchWriteItemOutput,
): response is BatchWriteItemOutputWithUnprocessedItems {
  if (!response.UnprocessedItems) {
    return false
  }
  return Object.values(response.UnprocessedItems).some((t) => !!t && t.length > 0)
}
