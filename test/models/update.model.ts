/* eslint-disable max-classes-per-file */
import { CollectionProperty, DateProperty, Model, PartitionKey, Property } from '../../src/dynamo-easy'

@Model()
export class Address {
  street: string
  place: string
  zip: number
}

@Model()
export class Info {
  details: string

  @DateProperty()
  createdAt: Date
}

@Model()
export class UpdateModel {
  @PartitionKey()
  id: string

  @DateProperty()
  creationDate: Date

  @DateProperty()
  lastUpdated: Date

  name: string

  @Property({ name: 'isActive' })
  active: boolean

  counter: number

  // maps to L(ist)
  addresses: Address[]

  @CollectionProperty({ sorted: true })
  numberValues: number[]

  @CollectionProperty({ itemType: Info })
  informations: Info[]

  // maps to M(ap)
  info: Info

  // maps to S(tring)S(et)
  topics: Set<string>
}
