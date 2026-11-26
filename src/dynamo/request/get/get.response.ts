/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * The response of a GetItem operation with the Item mapped to the model class.
 */
export interface GetResponse<T> extends Omit<DynamoDB.GetItemCommandOutput, 'Item'> {
  /**
   * A map of attribute names to AttributeValue objects (subset if ProjectionExpression was defined).
   */
  Item: T | null
}
