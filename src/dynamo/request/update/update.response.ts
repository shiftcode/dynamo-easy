/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * The response of an UpdateItem operation with the returned Attributes mapped to the model class.
 */
export interface UpdateResponse<T> extends Omit<DynamoDB.UpdateItemCommandOutput, 'Attributes'> {
  /**
   * The (partial) item before or after the update, depending on ReturnValues.
   */
  Item: T
}
