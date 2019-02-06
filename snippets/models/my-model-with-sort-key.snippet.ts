import { Model, PartitionKey, SortKey } from '@shiftcoders/dynamo-easy'

@Model()
export class MyModel {
  @PartitionKey()
  myPartitionKey: string

  @SortKey()
  mySortKey: number
}
