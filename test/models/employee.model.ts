import { DateProperty, Model, SortedSet } from '../../src/dynamo-easy'

// comment
@Model()
export class Employee {
  name: string

  age: number

  @DateProperty()
  createdAt: Date | null

  @SortedSet()
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
