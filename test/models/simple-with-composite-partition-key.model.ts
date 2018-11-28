import { DateProperty, Model, PartitionKey, SortKey } from '../../src/dynamo-easy'

@Model()
export class SimpleWithCompositePartitionKeyModel {
  @PartitionKey()
  id: string

  @SortKey()
  @DateProperty()
  creationDate: Date

  age: number
}
