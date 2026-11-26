/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * The (combined) response of the BatchGetItem operation(s) with the Items mapped to the model class.
 */
export interface BatchGetSingleTableResponse<T> extends Omit<DynamoDB.BatchGetItemOutput, 'Responses'> {
  /**
   * The items read from the table.
   */
  Items: T[]
}
