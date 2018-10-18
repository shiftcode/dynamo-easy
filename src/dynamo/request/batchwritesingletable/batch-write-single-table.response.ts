import { ConsumedCapacityMultiple } from 'aws-sdk/clients/dynamodb'

export interface BatchWriteSingleTableResponse {
  remainingItems: number
  capacityExceeded: boolean
  consumedCapacity?: ConsumedCapacityMultiple
}
