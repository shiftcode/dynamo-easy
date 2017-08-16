import { TypedArray } from "../../src/decorator/array.decorator"
import { Model } from "../../src/decorator/model.decorator"
import { Property } from "../../src/decorator/property.decorator"
import { SortedSet } from "../../src/decorator/sorted-set.decorator"
import { NestedComplexModel } from "./nested-complex.model"

@Model()
export class ProductNested {
  /*
   * introduce new decorators
   */
  // @SortedArray()
  // @Set()
  // @Date()
  @SortedSet() collection: Set<string>

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
  @Property() nestedValue: NestedComplexModel

  // @Type(Array, ProductNested)
  @TypedArray(ProductNested) list: ProductNested[]

  constructor() {
    this.nestedValue = new NestedComplexModel()
    this.list = []
    this.list.push(new ProductNested())
  }
}
