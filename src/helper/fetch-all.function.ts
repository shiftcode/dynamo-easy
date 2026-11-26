/**
 * @module helper
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { QueryRequest } from '../dynamo/request/query/query.request'
import { ReadManyRequest } from '../dynamo/request/read-many.request'
import { ScanRequest } from '../dynamo/request/scan/scan.request'

/**
 * When we cant load all the items of a table with one request, we will fetch as long as there is more data
 * available. This can be used with scan and query requests.
 */

export function fetchAll<T>(
  request: ScanRequest<T> | QueryRequest<T>,
  startKey?: Record<string, DynamoDB.AttributeValue>,
): Promise<T[]> {
  request.limit(ReadManyRequest.INFINITE_LIMIT)
  if (startKey) {
    request.exclusiveStartKey(startKey)
  }
  return request.execFullResponse().then((response) => {
    if (response.LastEvaluatedKey) {
      return fetchAll(request, response.LastEvaluatedKey).then((innerResponse) => [...response.Items, ...innerResponse])
    } else {
      return response.Items
    }
  })
}
