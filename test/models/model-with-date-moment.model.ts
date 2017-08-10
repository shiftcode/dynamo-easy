import { Model } from "../../src/decorators/model.decorator"
import { PartitionKey } from "../../src/decorators/partition-key.decorator"
import { SortKey } from "../../src/decorators/sort-key.decorator"
import { Type } from "../../src/decorators/type.decorator"
import moment from "moment"

@Model()
export class ModelWithDateMoment {
  @PartitionKey() id: string

  @SortKey() creationDate: moment.Moment

  @Type("moment") lastUpdated: moment.Moment
}
