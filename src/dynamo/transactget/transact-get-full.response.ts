/**
 * @module multi-model-requests/transact-get
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'

export interface TransactGetFullResponse<X> {
  Items: X
  ConsumedCapacity?: DynamoDB.ConsumedCapacityMultiple
}
