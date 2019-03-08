import { DateProperty, Model, PartitionKey, SortKey } from '../../src/dynamo-easy'

@Model({ tableName: 'SimpleWithCompositePartitionKeyModel' })
export class SimpleWithCompositePartitionKeyModel {
  @PartitionKey()
  id: string

  @SortKey()
  @DateProperty()
  creationDate: Date

  age: number
}
