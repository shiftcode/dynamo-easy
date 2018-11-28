import { Date, Model, PartitionKey, Property, SortedSet } from '../../src/dynamo-easy'

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

  @Date()
  creationDate: Date

  @Date()
  lastUpdated: Date

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
