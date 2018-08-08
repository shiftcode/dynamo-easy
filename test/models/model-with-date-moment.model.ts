import moment from 'moment'
import { Date } from '../../src/decorator/impl/date/date.decorator'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { SortKey } from '../../src/decorator/impl/key/sort-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Moment } from '../../src/moment.type'

@Model()
export class ModelWithDateMoment {
  @PartitionKey()
  id: string

  @SortKey()
  creationDate: moment.Moment

  @Date()
  lastUpdated: moment.Moment
}
