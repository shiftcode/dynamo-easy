import { Model } from "../../src/decorator/model.decorator"
import { PartitionKey } from "../../src/decorator/partition-key.decorator"
import { SortKey } from "../../src/decorator/sort-key.decorator"
import { Moment } from "../../src/moment.type"
import { Date } from "../../src/decorator/date.decorator"
import moment from "moment"

@Model()
export class ModelWithDateMoment {
  @PartitionKey() id: string

  @SortKey() creationDate: moment.Moment

  @Date() lastUpdated: moment.Moment
}
