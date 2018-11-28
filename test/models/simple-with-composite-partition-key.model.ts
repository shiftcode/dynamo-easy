import { Date, Model, PartitionKey, SortKey } from '../../src/dynamo-easy'

@Model()
export class SimpleWithCompositePartitionKeyModel {
  @PartitionKey()
  id: string

  @SortKey()
  @Date()
  creationDate: Date

  age: number
}
