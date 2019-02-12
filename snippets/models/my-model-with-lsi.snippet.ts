import { Model, LSISortKey, PartitionKey, SortKey } from '@shiftcoders/dynamo-easy'

@Model()
class MyModel {
  @PartitionKey()
  myPartitionKey: string

  @SortKey()
  mySortKey: number

  @LSISortKey('NameOfLSI')
  myLsiSortKey: number
}
