import * as moment from 'moment'
import { SortedSet } from '../../src/decorator/impl/collection/sorted-set.decorator'
import { TypedArray } from '../../src/decorator/impl/collection/typed-array.decorator'
import { TypedSet } from '../../src/decorator/impl/collection/typed-set.decorator'
import { Date } from '../../src/decorator/impl/date/date.decorator'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { SortKey } from '../../src/decorator/impl/key/sort-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Property } from '../../src/decorator/impl/property/property.decorator'
import { Transient } from '../../src/decorator/impl/transient/transient.decorator'
import { Employee } from './employee.model'

// tslint:disable:max-classes-per-file
@Model()
export class Gift {
  description: string
}

@Model()
export class Birthday {
  @Date()
  date: moment.Moment

  @TypedArray(Gift)
  presents: Gift[]

  constructor(date: moment.Moment, ...gifts: string[]) {
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

@Model({ tableName: 'Organization' })
export class Organization {
  // String
  @PartitionKey()
  id: string

  name: string

  @SortKey()
  @Date()
  createdAtDate: moment.Moment

  @Date()
  lastUpdated: moment.Moment

  // Boolean
  active: boolean

  // Number
  count = 52

  // @Property()
  // myMap: Map<string, string>;

  @Transient()
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
