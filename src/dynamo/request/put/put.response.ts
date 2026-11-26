/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * The response of a PutItem operation with the returned Attributes mapped to the model class.
 */
export interface PutResponse<T> extends Omit<DynamoDB.PutItemCommandOutput, 'Attributes'> {
  /**
   * The item as it appeared before the PutItem operation (only if ReturnValues was ALL_OLD).
   */
  Item: T
}
