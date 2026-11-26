/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * The response of a Scan operation with the Items mapped to the model class.
 */
export interface ScanResponse<T> extends Omit<DynamoDB.ScanCommandOutput, 'Items' | 'Count'> {
  /**
   * The items matching the scan criteria (subset of attributes if ProjectionExpression was defined).
   */
  Items: T[]
  /**
   * The number of items in the response (after applying a filter, if any).
   */
  Count: number
}
