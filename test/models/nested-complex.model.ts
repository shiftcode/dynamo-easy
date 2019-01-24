import { CollectionProperty } from '../../src/decorator/impl/collection/collection-property.decorator'
import { Model } from '../../src/dynamo-easy'

@Model()
export class NestedComplexModel {
  // should be mapped to a L DynamoDb Type to preserve the order
  @CollectionProperty({ sorted: true })
  sortedSet: Set<string>

  constructor() {
    this.sortedSet = new Set(['firstValue', 'secondeValue'])
  }
}
