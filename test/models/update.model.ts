import * as moment from 'moment'
import { SortedSet } from '../../src/decorator'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Property } from '../../src/decorator/impl/property/property.decorator'

// tslint:disable-next-line:max-classes-per-file
@Model()
export class Address {
  street: string
  place: string
  zip: number
}

// tslint:disable-next-line:max-classes-per-file
@Model()
export class Info {
  details: string
}

// tslint:disable-next-line:max-classes-per-file
@Model()
export class UpdateModel {
  @PartitionKey()
  id: string

  creationDate: moment.Moment

  lastUpdated: moment.Moment

  name: string

  @Property({ name: 'isActive' })
  active: boolean

  counter: number

  // maps to L(ist)
  addresses: Address[]

  @SortedSet()
  numberValues: number[]

  // maps to M(ap)
  info: Info

  // maps to S(tring)S(et)
  topics: string[]
}
