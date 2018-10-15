import { ConsumedCapacityMultiple } from 'aws-sdk/clients/dynamodb'

export interface BatchWriteResponse {
  remainingItems: number
  capacityExceeded: boolean
  consumedCapacity?: ConsumedCapacityMultiple
}
