import { Model } from "../../src/decorators/model.decorator"
import { PartitionKey } from "../../src/decorators/partition-key.decorator"
import { SortKey } from "../../src/decorators/sort-key.decorator"
import { Property } from "../../src/decorators/property.decorator"

@Model()
export class ModelWithDate {
  @PartitionKey() id: string

  @SortKey() creationDate: Date
}
