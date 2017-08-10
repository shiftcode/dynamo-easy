import { Model } from "./decorators/model.decorator"
import { Property } from "./decorators/property.decorator"
import { Employee } from "../test/models/employee.model"

/**
 * add interfaces for indexes
 */
export class NestedModel {
  id: string
}

@Model({ tableName: "sample" })
export class SampleModel {
  @Property({ name: "id" })
  // @PartitionKey()
  // @RangeKey()
  id: string

  @Property()
  // @Index({name: INDEX_BLA, hashKey: true })
  active: boolean

  @Property() map: Map<String, String>

  @Property() employee: Employee

  // Ref
  // @Ref(field: 'id', strategy)
  itemRefs: string[]

  @Property() nestedValue: NestedModel

  @Property() myMap: Map<string, string>

  @Property() mySet: Set<String>
  // Version to
}

// export class UiSampleModel extends SampleModel {
//   items: RefModel[];
// }
