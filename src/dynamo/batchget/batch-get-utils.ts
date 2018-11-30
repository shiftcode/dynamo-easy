import { DynamoDB } from 'aws-sdk'
import { BatchGetRequestMap } from 'aws-sdk/clients/dynamodb'
import { Observable, of } from 'rxjs'
import { delay, map, mergeMap } from 'rxjs/operators'
import { DynamoRx } from '../dynamo-rx'

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
          return of(response.UnprocessedKeys)
            .pipe(
              delay(backoffTimer.next().value * throttleTimeSlot),
              mergeMap((UnprocessedKeys: DynamoDB.BatchGetRequestMap) => {
                const nextParams = { ...params, RequestItems: UnprocessedKeys }
                return batchGetItemsFetchAll(dynamoRx, nextParams, backoffTimer, throttleTimeSlot)
              }),
              map(combineBatchGetResponses(response)),
            )
        }
        return of(response)
      }),
    )
}

export type ResponseWithUnprocessedKeys = DynamoDB.BatchGetItemOutput & { UnprocessedKeys: BatchGetRequestMap }

export function hasUnprocessedKeys(response: DynamoDB.BatchGetItemOutput): response is ResponseWithUnprocessedKeys {
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
