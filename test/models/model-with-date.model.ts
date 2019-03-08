import { Model, PartitionKey, SortKey } from '../../src/dynamo-easy'

@Model({ tableName: 'ModelWithDate' })
export class ModelWithDate {
  @PartitionKey()
  id: string

  @SortKey()
  creationDate: Date
}
