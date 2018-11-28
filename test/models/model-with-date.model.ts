import { Model, PartitionKey, SortKey } from '../../src/dynamo-easy'

@Model()
export class ModelWithDate {
  @PartitionKey()
  id: string

  @SortKey()
  creationDate: Date
}
