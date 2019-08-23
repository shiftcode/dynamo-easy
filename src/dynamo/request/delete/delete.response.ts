/**
 * @module store-requests
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'

export interface DeleteResponse<T> {
  ConsumedCapacity?: DynamoDB.ConsumedCapacity
  ItemCollectionMetrics?: DynamoDB.ItemCollectionMetrics
  Item: T
}
