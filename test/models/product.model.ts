/* eslint-disable max-classes-per-file */
import { CollectionProperty, Model, Property } from '../../src/dynamo-easy'
import { NestedComplexModel } from './nested-complex.model'

@Model()
export class ProductNested {
  @CollectionProperty({ sorted: true })
  collection: Set<string>

  counter = 0

  constructor() {
    this.collection = new Set<string>()
    for (let i = 0; i < 3; i++) {
      this.collection.add(`value${++this.counter}`)
    }
  }
}

@Model()
export class Product {
  @Property()
  nestedValue: NestedComplexModel

  @CollectionProperty({ itemType: ProductNested })
  list: ProductNested[]

  constructor() {
    this.nestedValue = new NestedComplexModel()
    this.list = []
    this.list.push(new ProductNested())
  }
}
