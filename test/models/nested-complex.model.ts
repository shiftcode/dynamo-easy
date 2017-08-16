import { Model } from "../../src/decorator/model.decorator"
import { SortedSet } from "../../src/decorator/sorted-set.decorator"

@Model()
export class NestedComplexModel {
  // should be mapped to a L DynamoDb Type to preserve the order
  @SortedSet() sortedSet: Set<string>

  constructor() {
    this.sortedSet = new Set(["firstValue", "secondeValue"])
  }
}
