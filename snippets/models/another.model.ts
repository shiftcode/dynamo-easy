import { CollectionProperty, DateProperty, Model, PartitionKey, SortKey } from '@shiftcoders/dynamo-easy'

@Model()
export class AnotherModel {
  @PartitionKey()
  propA: string

  @SortKey()
  propB: string


  propC?: string

  @CollectionProperty()
  myNestedList?: any[]

  @DateProperty()
  updated: Date
}
