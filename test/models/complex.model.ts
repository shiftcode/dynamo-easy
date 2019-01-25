import { CollectionProperty } from '../../src/decorator/impl/collection/collection-property.decorator'
import { DateProperty, Model, PartitionKey, Property, SortKey, Transient } from '../../src/dynamo-easy'
import { NestedObject } from './nested-object.model'

@Model({ tableName: 'complex_model' })
export class ComplexModel {
  @PartitionKey()
  id: string

  @SortKey()
  @DateProperty()
  creationDate: Date

  @DateProperty()
  lastUpdated: Date

  @Property({ name: 'isActive' })
  active: boolean

  @CollectionProperty()
  set: Set<string>

  /*
   * actually this value is always mapped to an array, so the typing is not correct,
   * we still leave it to check if it works
   */
  @CollectionProperty({ sorted: true })
  sortedSet: Set<string>

  @CollectionProperty({ sorted: true, itemType: NestedObject })
  sortedComplexSet: Set<NestedObject>

  @Property()
  mapWithNoType: Map<string, string>

  simpleProperty: number

  @Transient()
  transientField: string

  @Property({ name: 'my_nested_object' })
  nestedObj: NestedObject
}
