import {
  Date,
  Model,
  PartitionKey,
  Property,
  SortedSet,
  SortKey,
  Transient,
  TypedArray,
  TypedSet,
} from '../../src/dynamo-easy'
import { Employee } from './employee.model'

// tslint:disable:max-classes-per-file
@Model()
export class Gift {
  description: string
}

@Model()
export class Birthday {
  @Date()
  date: Date

  @TypedArray(Gift)
  presents: Gift[]

  constructor(date: Date, ...gifts: string[]) {
    this.date = date
    const giftArr: Gift[] = []
    gifts.forEach(giftDescription => giftArr.push({ description: giftDescription }))
    this.presents = giftArr
  }
}

@Model()
export class OrganizationEvent {
  name: string

  @Property({ name: 'participantCount' })
  participants: number

  constructor(name: string, participants: number) {
    this.name = name
    this.participants = participants
  }
}

// TODO LOW maybe we can map the transient fields to be optional in Attributes
// export type Transient<T> = T

@Model({ tableName: 'Organization' })
export class Organization {
  // String
  @PartitionKey()
  id: string

  name: string

  @SortKey()
  @Date()
  createdAtDate: Date

  @Date()
  lastUpdated: Date

  // Boolean
  active: boolean

  // Number
  count = 52

  @Transient()
  // transient: Transient<any>
  transient: any

  /*
   * collections
   */

  /*
   * ARRAY
   */

  // simple type (no metadata required)
  domains: string[]

  // simple type, mixed (no metadata required)
  randomDetails: any[]

  // complex type (requries metadata)
  @TypedArray(Employee)
  employees: Employee[]

  /*
   * SET
   */

  // set with simple type -> SS
  // @TypedSet()
  cities: Set<string>

  // set with complex type -> L(ist)
  @TypedSet(Birthday)
  birthdays: Set<Birthday>

  // set with simple type -> sorted -> L(ist)
  @SortedSet()
  awards: Set<string>

  // set with complex type -> sorted -> L(ist)
  @SortedSet(OrganizationEvent)
  events: Set<OrganizationEvent>

  @TypedSet()
  emptySet: Set<string> = new Set()

  // tslint:disable-next-line:no-empty
  constructor() {}
}
