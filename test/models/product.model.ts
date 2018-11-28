// tslint:disable:max-classes-per-file
import { Model, Property, SortedSet, TypedArray } from '../../src/dynamo-easy'
import { NestedComplexModel } from './nested-complex.model'

@Model()
export class ProductNested {
  @SortedSet()
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

  @TypedArray(ProductNested)
  list: ProductNested[]

  constructor() {
    this.nestedValue = new NestedComplexModel()
    this.list = []
    this.list.push(new ProductNested())
  }
}
