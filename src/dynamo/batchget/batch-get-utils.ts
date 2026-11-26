/**
 * @module multi-model-requests/batch-get
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { promiseDelay } from '../../helper/promise-delay.function'
import { BATCH_GET_DEFAULT_MAX_DELAY, BATCH_GET_DEFAULT_MAX_RETRIES } from './batch-get.const'

/**
 * Function which executes batchGetItem operations until all given items (as params) are processed (fetched).
 * Between each follow-up request (in case of unprocessed items) a delay is interposed calculated by the given backoffTime and throttleTimeSlot.
 * Own backoff crucial: partially throttled batches succeed with `UnprocessedKeys` instead of throwing,
 * Resending instantly would likely hit the same throttled partitions again (hot loop of partial successes, adding load).
 * AWS recommends exponential backoff. @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html
 * @param client
 * @param params containing the keys per table to create the batchGet operation
 * @param backoffTimer used to determine how many time slots the follow-up request should be delayed
 * @param throttleTimeSlot used to calculate the effective wait time
 * @param maxDelay upper bound in ms for a single delay between follow-up requests
 * @param maxRetries max number of follow-up requests. rejects if there are still UnprocessedKeys afterwards
 * @hidden
 */
export function batchGetItemsFetchAll(
  client: DynamoDB.DynamoDBClient,
  params: DynamoDB.BatchGetItemInput,
  backoffTimer: IterableIterator<number>,
  throttleTimeSlot: number,
  maxDelay = BATCH_GET_DEFAULT_MAX_DELAY,
  maxRetries = BATCH_GET_DEFAULT_MAX_RETRIES,
): Promise<DynamoDB.BatchGetItemOutput> {
  return client.send(new DynamoDB.BatchGetItemCommand(params)).then((response) => {
    if (hasUnprocessedKeys(response)) {
      if (maxRetries <= 0) {
        throw new Error(
          `batchGetItemsFetchAll: still UnprocessedKeys after max retries: ${JSON.stringify(response.UnprocessedKeys)}`,
        )
      }
      // in case of unprocessedKeys do a follow-up requests
      return (
        Promise.resolve(response.UnprocessedKeys)
          // delay before doing the follow-up request
          .then(promiseDelay(Math.min(backoffTimer.next().value * throttleTimeSlot, maxDelay)))
          .then((UnprocessedKeys) => {
            const nextParams = { ...params, RequestItems: UnprocessedKeys }
            // call recursively batchGetItemsFetchAll with the returned UnprocessedItems params
            return batchGetItemsFetchAll(client, nextParams, backoffTimer, throttleTimeSlot, maxDelay, maxRetries - 1)
          })
          .then(combineBatchGetResponses(response))
      )
    }
    // no follow-up request necessary, return result
    return response
  })
}

/**
 * @hidden
 */
export type BatchGetItemOutputWithUnprocessedKeys = DynamoDB.BatchGetItemOutput & {
  UnprocessedKeys: Record<string, DynamoDB.KeysAndAttributes>
}

/**
 * @hidden
 */
export function hasUnprocessedKeys(
  response: DynamoDB.BatchGetItemOutput,
): response is BatchGetItemOutputWithUnprocessedKeys {
  if (!response.UnprocessedKeys) {
    return false
  }
  return Object.values(response.UnprocessedKeys).some((t) => !!t && t.Keys && t.Keys.length > 0)
}

/**
 * combines a first with a second response. ConsumedCapacity is always from the latter.
 * @hidden
 */
export function combineBatchGetResponses(response1: DynamoDB.BatchGetItemOutput) {
  return (response2: DynamoDB.BatchGetItemOutput): DynamoDB.BatchGetItemOutput => {
    const tableNames: string[] = Object.keys(response1.Responses || {})

    Object.keys(response2.Responses || {})
      .filter((tn) => !tableNames.includes(tn))
      .forEach((tn) => tableNames.push(tn))

    const Responses = tableNames.reduce(
      (u, tableName) => ({
        ...u,
        [tableName]: [
          ...((response1.Responses && response1.Responses[tableName]) || []),
          ...((response2.Responses && response2.Responses[tableName]) || []),
        ],
      }),
      {},
    )
    return {
      ...response2,
      Responses,
    }
  }
}
