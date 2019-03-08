import { CollectionProperty, DateProperty, Model, PartitionKey, Property } from '../../src/dynamo-easy'

// tslint:disable-next-line:max-classes-per-file
@Model({ tableName: 'Address' })
export class Address {
  street: string
  place: string
  zip: number
}

// tslint:disable-next-line:max-classes-per-file
@Model({ tableName: 'Info' })
export class Info {
  details: string

  @DateProperty()
  createdAt: Date
}

// tslint:disable-next-line:max-classes-per-file
@Model({ tableName: 'UpdateModel' })
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
