import { Model } from '../../src/decorators/model.decorator'
import { PartitionKey } from '../../src/decorators/partition-key.decorator'
import { SortKey } from '../../src/decorators/sort-key.decorator'
import { Type } from '../../src/decorators/type.decorator'
import { Property } from '../../src/decorators/property.decorator'
import { Transient } from '../../src/decorators/transient.decorator'

export class NestedObject {
  id: string
}

@Model({ tableName: 'complex_model' })
export class ComplexModel {
  @PartitionKey() ids: string

  @SortKey() creationDate: moment.Moment

  @Type('moment') lastUpdated: moment.Moment

  @Property({ name: 'isActive' })
  active: boolean

  @Type(Set) set: Set<String>

  @Type(Map) myMap: Map<String, String>

  @Property() mapWithNoType: Map<String, String>

  simpleProperty: number

  @Transient() transientField: string

  @Property() nestedObj: NestedObject
}
