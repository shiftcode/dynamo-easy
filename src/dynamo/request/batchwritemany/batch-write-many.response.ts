import { ConsumedCapacityMultiple } from 'aws-sdk/clients/dynamodb'

export interface BatchWriteManyResponse {
  remainingItems: number
  capacityExceeded: boolean
  consumedCapacity?: ConsumedCapacityMultiple
}
