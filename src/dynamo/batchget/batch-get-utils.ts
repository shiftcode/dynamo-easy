import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable, of } from 'rxjs'
import { delay, map, mergeMap } from 'rxjs/operators'
import { DynamoRx } from '../dynamo-rx'

/**
 * Function which executes batchGetItem operations until all given items (as params) are processed (fetched).
 * Between each follow-up request (in case of unprocessed items) a delay is interposed calculated by the given backoffTime and throttleTimeSlot.
 * @param dynamoRx
 * @param params containing the keys per table to create the batchGet operation
 * @param backoffTimer used to determine how many time slots the follow-up request should be delayed
 * @param throttleTimeSlot used to calculate the effective wait time
 */
export function batchGetItemsFetchAll(
  dynamoRx: DynamoRx,
  params: DynamoDB.BatchGetItemInput,
  backoffTimer: IterableIterator<number>,
  throttleTimeSlot: number,
): Observable<DynamoDB.BatchGetItemOutput> {
  return dynamoRx.batchGetItems(params)
    .pipe(
      mergeMap(response => {
        if (hasUnprocessedKeys(response)) {
          // in case of unprocessedItems do a follow-up requests
          return of(response.UnprocessedKeys)
            .pipe(
              // delay before doing the follow-up request
              delay(backoffTimer.next().value * throttleTimeSlot),

              mergeMap((UnprocessedKeys: DynamoDB.BatchGetRequestMap) => {
                const nextParams = { ...params, RequestItems: UnprocessedKeys }
                // call recursively batchGetItemsFetchAll with the returned UnprocessedItems params
                return batchGetItemsFetchAll(dynamoRx, nextParams, backoffTimer, throttleTimeSlot)
              }),
              map(combineBatchGetResponses(response)),
            )
        }
        // no follow-up request necessary, return result
        return of(response)
      }),
    )
}

export type BatchGetItemOutputWithUnprocessedKeys =
  DynamoDB.BatchGetItemOutput
  & { UnprocessedKeys: DynamoDB.BatchGetRequestMap }

export function hasUnprocessedKeys(response: DynamoDB.BatchGetItemOutput): response is BatchGetItemOutputWithUnprocessedKeys {
  if (!response.UnprocessedKeys) {
    return false
  }
  return Object.values(response.UnprocessedKeys)
    .some(t => !!t && t.Keys && t.Keys.length > 0)
}

/**
 * combines a first with a second response. ConsumedCapacity is always from the latter.
 * @param response1
 */
export function combineBatchGetResponses(response1: DynamoDB.BatchGetItemOutput) {
  return (response2: DynamoDB.BatchGetItemOutput): DynamoDB.BatchGetItemOutput => {
    const tableNames: string[] = Object.keys(response1.Responses || {})

    Object.keys(response2.Responses || {})
      .filter(tn => !tableNames.includes(tn))
      .forEach(tn => tableNames.push(tn))

    const Responses = tableNames
      .reduce((u, tableName) => ({
        ...u,
        [tableName]: [
          ...(response1.Responses && response1.Responses[tableName] || []),
          ...(response2.Responses && response2.Responses[tableName] || []),
        ],
      }), {})
    return {
      ...response2,
      Responses,
    }
  }
}
