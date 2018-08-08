import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'

@Model()
export class SimpleWithPartitionKeyModel {
  @PartitionKey()
  id: string

  age: number
}
