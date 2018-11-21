import { SortedSet } from '../../src/decorator/impl/collection/sorted-set.decorator'
import { Date } from '../../src/decorator/impl/date/date.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'

@Model()
export class Employee {
  name: string

  age: number

  @Date()
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
