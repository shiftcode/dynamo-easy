import { CollectionProperty } from '../../src/decorator/impl/collection/collection-property.decorator'
import { DateProperty, Model } from '../../src/dynamo-easy'

@Model()
export class Employee {
  name: string

  age: number

  @DateProperty()
  createdAt: Date | null

  @CollectionProperty({ sorted: true })
  sortedSet: Set<string>

  constructor(name: string, age: number, createdAt: Date | null, sortedListValues: any[] | null) {
    this.name = name
    this.age = age
    this.createdAt = createdAt
    if (sortedListValues) {
      this.sortedSet = new Set(sortedListValues)
    }
  }
}
