/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * copied from aws-sdk/clients/dynamoDb GetItemOutput but added generics, because we process the items and map them
 * to an actual type
 */
export interface GetResponse<T> {
  /**
   * A map of attribute names to AttributeValue objects (subset if ProjectionExpression was defined).
   */
  Item: T | null
  /**
   * The capacity units consumed by the GetItem operation. The data returned includes the total provisioned throughput consumed, along with statistics for the table and any indexes involved in the operation. ConsumedCapacity is only returned if the ReturnConsumedCapacity parameter was specified. For more information, see Provisioned Throughput in the Amazon DynamoDB Developer Guide.
   */
  ConsumedCapacity?: DynamoDB.ConsumedCapacity
}
