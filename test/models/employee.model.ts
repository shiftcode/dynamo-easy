import moment from 'moment'
import { Model } from '../../src/decorator/model.decorator'
import { SortedSet } from '../../src/decorator/sorted-set.decorator'

@Model()
export class Employee {
  name: string

  age: number

  createdAt: moment.Moment | null

  @SortedSet() sortedSet: Set<string>

  constructor(name: string, age: number, createdAt: moment.Moment | null, sortedListValues: any[] | null) {
    this.name = name
    this.age = age
    this.createdAt = createdAt
    if (sortedListValues) {
      this.sortedSet = new Set(sortedListValues)
    }
  }
}
