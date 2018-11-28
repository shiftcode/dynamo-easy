import { Model, PartitionKey } from '../../src/dynamo-easy'

@Model()
export class SimpleWithPartitionKeyModel {
  @PartitionKey()
  id: string

  age: number
}
