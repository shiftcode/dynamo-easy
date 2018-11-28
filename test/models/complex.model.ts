import { Date, Model, PartitionKey, Property, SortedSet, SortKey, Transient, TypedSet } from '../../src/dynamo-easy'
import { NestedObject } from './nested-object.model'

@Model({ tableName: 'complex_model' })
export class ComplexModel {
  @PartitionKey()
  id: string

  @SortKey()
  @Date()
  creationDate: Date

  @Date()
  lastUpdated: Date

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
