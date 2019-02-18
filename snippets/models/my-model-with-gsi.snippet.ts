import { Model, GSIPartitionKey, GSISortKey } from '@shiftcoders/dynamo-easy'

const MY_MODEL_GSI = 'NameOfGSI'

@Model()
class MyModel {
  @GSIPartitionKey(MY_MODEL_GSI)
  myGsiPartitionKey: string

  @GSISortKey(MY_MODEL_GSI)
  myGsiSortKey: number
}
