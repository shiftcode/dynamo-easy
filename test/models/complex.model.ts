import moment from 'moment'
import { Date } from '../../src/decorator/date.decorator'
import { Model } from '../../src/decorator/model.decorator'
import { PartitionKeyUUID } from '../../src/decorator/partition-key-uuid.decorator'
import { PartitionKey } from '../../src/decorator/partition-key.decorator'
import { Property } from '../../src/decorator/property.decorator'
import { SortKey } from '../../src/decorator/sort-key.decorator'
import { SortedSet } from '../../src/decorator/sorted-set.decorator'
import { Transient } from '../../src/decorator/transient.decorator'
import { TypedSet } from '../../src/decorator/typed-set.decorator'
import { NestedObject } from './nested-object.model'

@Model({ tableName: 'complex_model' })
export class ComplexModel {
  @PartitionKey() id: string

  @SortKey() creationDate: moment.Moment

  @Date() lastUpdated: moment.Moment

  @Property({ name: 'isActive' })
  active: boolean

  @TypedSet() set: Set<string>

  // @Type(Map)
  // myMap: Map<String, String>;

  /*
   * actually this value is always mapped to an array, so the typing is not correct,
   * we still leave it to check if it works
   */
  @SortedSet() sortedSet: Set<string>

  @SortedSet(NestedObject) sortedComplexSet: Set<NestedObject>

  @Property() mapWithNoType: Map<string, string>

  simpleProperty: number

  @Transient() transientField: string

  @Property() nestedObj: NestedObject
}
