import { Model, PartitionKey, SortKey } from '@shiftcoders/dynamo-easy'

@Model({tableName: 'my-models'})
export class MyModel {
  @PartitionKey()
  myPartitionKey: string

  @SortKey()
  mySortKey: number
}
