/**
 * @module multi-model-requests/transact-get
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * The response of a TransactGetItems operation with the Items mapped to their model classes.
 */
export interface TransactGetFullResponse<X extends ReadonlyArray<unknown>> extends Omit<
  DynamoDB.TransactGetItemsOutput,
  'Responses'
> {
  /**
   * The read items, in the same order as requested.
   */
  Items: X
}
