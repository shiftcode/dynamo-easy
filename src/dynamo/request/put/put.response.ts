/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

export interface PutResponse<T> {
  ConsumedCapacity?: DynamoDB.ConsumedCapacity
  ItemCollectionMetrics?: DynamoDB.ItemCollectionMetrics
  Item: T
}
