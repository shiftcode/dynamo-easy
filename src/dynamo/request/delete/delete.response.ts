/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * The response of a DeleteItem operation with the returned Attributes mapped to the model class.
 */
export interface DeleteResponse<T> extends Omit<DynamoDB.DeleteItemCommandOutput, 'Attributes'> {
  /**
   * The item as it appeared before the DeleteItem operation (only if ReturnValues was ALL_OLD).
   */
  Item: T
}
