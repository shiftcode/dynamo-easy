/**
 * @module multi-model-requests/batch-get
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseDelay } from '../../helper/promise-delay.function'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'

/**
 * Function which executes batchGetItem operations until all given items (as params) are processed (fetched).
 * Between each follow-up request (in case of unprocessed items) a delay is interposed calculated by the given backoffTime and throttleTimeSlot.
 * @param dynamoDBWrapper
 * @param params containing the keys per table to create the batchGet operation
 * @param backoffTimer used to determine how many time slots the follow-up request should be delayed
 * @param throttleTimeSlot used to calculate the effective wait time
 * @hidden
 */
export function batchGetItemsFetchAll(
  dynamoDBWrapper: DynamoDbWrapper,
  params: DynamoDB.BatchGetItemInput,
  backoffTimer: IterableIterator<number>,
  throttleTimeSlot: number,
): Promise<DynamoDB.BatchGetItemOutput> {
  return dynamoDBWrapper.batchGetItems(params).then(response => {
    if (hasUnprocessedKeys(response)) {
      // in case of unprocessedKeys do a follow-up requests
      return (
        Promise.resolve(response.UnprocessedKeys)
          // delay before doing the follow-up request
          .then(promiseDelay(backoffTimer.next().value * throttleTimeSlot))
          .then(UnprocessedKeys => {
            const nextParams = { ...params, RequestItems: UnprocessedKeys }
            // call recursively batchGetItemsFetchAll with the returned UnprocessedItems params
            return batchGetItemsFetchAll(dynamoDBWrapper, nextParams, backoffTimer, throttleTimeSlot)
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
  UnprocessedKeys: DynamoDB.BatchGetRequestMap
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
  return Object.values(response.UnprocessedKeys).some(t => !!t && t.Keys && t.Keys.length > 0)
}

/**
 * combines a first with a second response. ConsumedCapacity is always from the latter.
 * @hidden
 */
export function combineBatchGetResponses(response1: DynamoDB.BatchGetItemOutput) {
  return (response2: DynamoDB.BatchGetItemOutput): DynamoDB.BatchGetItemOutput => {
    const tableNames: string[] = Object.keys(response1.Responses || {})

    Object.keys(response2.Responses || {})
      .filter(tn => !tableNames.includes(tn))
      .forEach(tn => tableNames.push(tn))

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
