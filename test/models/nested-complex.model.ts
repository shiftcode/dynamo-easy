import { Model, SortedSet } from '../../src/dynamo-easy'

@Model()
export class NestedComplexModel {
  // should be mapped to a L DynamoDb Type to preserve the order
  @SortedSet()
  sortedSet: Set<string>

  constructor() {
    this.sortedSet = new Set(['firstValue', 'secondeValue'])
  }
}
