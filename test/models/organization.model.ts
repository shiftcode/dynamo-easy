import { Model } from '../../src/decorators/model.decorator'
import { PartitionKey } from '../../src/decorators/partition-key.decorator'
import { SortKey } from '../../src/decorators/sort-key.decorator'
import { Type } from '../../src/decorators/type.decorator'
import { Employee } from './employee.model'
import { Transient } from '../../src/decorators/transient.decorator'
import moment from 'moment'

@Model({ tableName: 'Organization' })
export class Organization {
  // String
  @PartitionKey() id: string

  @SortKey() createdAtDate: moment.Moment

  @Type('moment') lastUpdated: moment.Moment

  employees: Employee[]

  // Boolean
  active

  // Number
  count = 52

  // @Property()
  // myMap: Map<string, string>;

  // Set (no duplicates, unique type)
  @Type(Set) cities: Set<string>

  @Type(Set) awardWinningYears: Set<number>

  mixedList: any[]

  @Transient() transient

  // tslint:disable-next-line:no-empty
  constructor() {}
}
