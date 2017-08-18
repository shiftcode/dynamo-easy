import moment from 'moment'
import { Model } from '../../src/decorator/model.decorator'
import { SortedSet } from '../../src/decorator/sorted-set.decorator'

@Model()
export class Employee {
  name: string

  age: number

  createdAt: moment.Moment

  @SortedSet() sortedSet: Set<string>

  constructor(name: string, age: number, createdAt: moment.Moment, sortedListValues: any[]) {
    this.name = name
    this.age = age
    this.createdAt = createdAt
    if (sortedListValues) {
      this.sortedSet = new Set(sortedListValues)
    }
  }
}
