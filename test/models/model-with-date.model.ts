import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { SortKey } from '../../src/decorator/impl/key/sort-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'

@Model()
export class ModelWithDate {
  @PartitionKey()
  id: string

  @SortKey()
  creationDate: Date
}
