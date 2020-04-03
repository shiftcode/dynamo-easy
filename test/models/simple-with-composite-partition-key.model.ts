/* eslint-disable max-classes-per-file */
import { DateProperty, Model, PartitionKey, Property, SortKey } from '../../src/dynamo-easy'

@Model()
export class SimpleWithCompositePartitionKeyModel {
  @PartitionKey()
  id: string

  @SortKey()
  @DateProperty()
  creationDate: Date

  age: number
}

@Model()
export class SimpleWithRenamedCompositePartitionKeyModel {
  @PartitionKey()
  @Property({ name: 'custom_id' })
  id: string

  @SortKey()
  @DateProperty({ name: 'custom_date' })
  creationDate: Date

  age: number
}
