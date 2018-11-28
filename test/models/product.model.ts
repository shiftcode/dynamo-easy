// tslint:disable:max-classes-per-file
import { Model, Property, SortedSet, TypedArray } from '../../src/dynamo-easy'
import { NestedComplexModel } from './nested-complex.model'

@Model()
export class ProductNested {
  /*
   * introduce new decorators
   */
  // @SortedArray()
  // @Set()
  // @Date()
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
  // @CustomMapper(ObjectMapper) --> works great
  @Property()
  nestedValue: NestedComplexModel

  // @Type(Array, ProductNested)
  @TypedArray(ProductNested)
  list: ProductNested[]

  constructor() {
    this.nestedValue = new NestedComplexModel()
    this.list = []
    this.list.push(new ProductNested())
  }
}
