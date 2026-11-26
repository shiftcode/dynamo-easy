/**
 * @module multi-model-requests/batch-get
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { BatchGetResponse } from './batch-get.response'

/**
 * The (combined) response of the BatchGetItem operation(s) with the Items mapped to their model classes.
 */
export interface BatchGetFullResponse extends Omit<DynamoDB.BatchGetItemOutput, 'Responses'> {
  /**
   * The read items per table name.
   */
  Responses: BatchGetResponse
}
