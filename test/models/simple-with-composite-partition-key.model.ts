import * as moment from 'moment'
import { Date } from '../../src/decorator/impl/date/date.decorator'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { SortKey } from '../../src/decorator/impl/key/sort-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'

@Model()
export class SimpleWithCompositePartitionKeyModel {
  @PartitionKey()
  id: string

  @SortKey()
  @Date()
  creationDate: moment.Moment

  age: number
}
