import { SortedSet } from '../../src/decorator/impl/collection/sorted-set.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'

@Model()
export class NestedComplexModel {
  // should be mapped to a L DynamoDb Type to preserve the order
  @SortedSet()
  sortedSet: Set<string>

  constructor() {
    this.sortedSet = new Set(['firstValue', 'secondeValue'])
  }
}
