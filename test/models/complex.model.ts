import * as moment from 'moment'
import { SortedSet } from '../../src/decorator/impl/collection/sorted-set.decorator'
import { TypedSet } from '../../src/decorator/impl/collection/typed-set.decorator'
import { Date } from '../../src/decorator/impl/date/date.decorator'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { SortKey } from '../../src/decorator/impl/key/sort-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Property } from '../../src/decorator/impl/property/property.decorator'
import { Transient } from '../../src/decorator/impl/transient/transient.decorator'
import { NestedObject } from './nested-object.model'

@Model({ tableName: 'complex_model' })
export class ComplexModel {
  @PartitionKey()
  id: string

  @SortKey()
  creationDate: moment.Moment

  @Date()
  lastUpdated: moment.Moment

  @Property({ name: 'isActive' })
  active: boolean

  @TypedSet()
  set: Set<string>

  // @Type(Map)
  // myMap: Map<String, String>;

  /*
   * actually this value is always mapped to an array, so the typing is not correct,
   * we still leave it to check if it works
   */
  @SortedSet()
  sortedSet: Set<string>

  @SortedSet(NestedObject)
  sortedComplexSet: Set<NestedObject>

  @Property()
  mapWithNoType: Map<string, string>

  simpleProperty: number

  @Transient()
  transientField: string

  @Property()
  nestedObj: NestedObject
}
