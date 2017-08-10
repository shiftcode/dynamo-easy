import { Model } from "../../src/decorators/model.decorator"
import moment from "moment"
import { Type } from "../../src/decorators/type.decorator"

@Model()
export class Employee {
  name: string

  age: number

  @Type("moment") createdAt: moment.Moment

  constructor(name: string, age: number, createdAt: moment.Moment) {
    this.name = name
    this.age = age
    this.createdAt = createdAt
  }
}
