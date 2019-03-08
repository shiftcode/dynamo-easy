import { Model, PartitionKey } from '../../src/dynamo-easy'

@Model({ tableName: 'simple-with-partition-key-models' })
export class SimpleWithPartitionKeyModel {
  @PartitionKey()
  id: string

  age: number
}
