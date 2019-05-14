import { Model, PartitionKey, Property } from '../../src/dynamo-easy'

@Model()
export class SimpleWithPartitionKeyModel {
  @PartitionKey()
  id: string

  age: number
}

@Model()
export class SimpleWithRenamedPartitionKeyModel {
  @PartitionKey()
  @Property({ name: 'custom_id' })
  id: string

  age: number
}
