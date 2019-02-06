import { Model, GSIPartitionKey, GSISortKey } from '@shiftcoders/dynamo-easy'

@Model()
class MyModel {
  @GSIPartitionKey('NameOfGSI')
  myGsiPartitionKey: string

  @GSISortKey('NameOfGSI')
  myGsiSortKey: number
}
