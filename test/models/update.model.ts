import * as moment from 'moment'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Property } from '../../src/decorator/impl/property/property.decorator'

@Model()
export class UpdateModel {
  @PartitionKey() id: string

  creationDate: moment.Moment

  lastUpdated: moment.Moment

  name: string

  @Property({ name: 'isActive' })
  active: boolean

  counter: number
}
