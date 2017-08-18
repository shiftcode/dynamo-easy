import moment from 'moment'
import { TypedArray } from '../../src/decorator/array.decorator'
import { Date } from '../../src/decorator/date.decorator'
import { Model } from '../../src/decorator/model.decorator'
import { PartitionKey } from '../../src/decorator/partition-key.decorator'
import { Property } from '../../src/decorator/property.decorator'
import { SortKey } from '../../src/decorator/sort-key.decorator'
import { SortedSet } from '../../src/decorator/sorted-set.decorator'
import { Transient } from '../../src/decorator/transient.decorator'
import { TypedSet } from '../../src/decorator/typed-set.decorator'
import { NestedModel } from '../../src/sample.model'
import { Employee } from './employee.model'

// @Model()
// export class Award {
//
//   @Property({name: 'nameOfAward'})
//   name: string;
//   year: number;
//
//   constructor(name, year){
//     this.name = name;
//     this.year = year;
//   }
//
// }
@Model()
export class Gift {
  description: string
}

@Model()
export class Birthday {
  date: moment.Moment

  @TypedArray(Gift) presents: Gift[]

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
  @PartitionKey() id: string

  name: string

  @SortKey() createdAtDate: moment.Moment

  @Date() lastUpdated: moment.Moment

  // Boolean
  active

  // Number
  count = 52

  // @Property()
  // myMap: Map<string, string>;

  @Transient() transient

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
  @TypedArray(Employee) employees: Employee[]

  /*
   * SET
   */

  // set with simple type -> SS
  // @TypedSet()
  cities: Set<string>

  // set with complex type -> L(ist)
  @TypedSet(Birthday) birthdays: Set<Birthday>

  // set with simple type -> sorted -> L(ist)
  @SortedSet() awards: Set<string>

  // set with complex type -> sorted -> L(ist)
  @SortedSet(OrganizationEvent) events: Set<OrganizationEvent>

  // TODO add map? year to benefit description
  // benefits: Map<number, string>

  // tslint:disable-next-line:no-empty
  constructor() {}
}
